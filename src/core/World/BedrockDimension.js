import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { EventEmitter } from 'node:events'
import { BedrockMap } from "../Storage/Maps/BedrockMap.js"
import { packV3, unpackV3, unpackChunkV3, V3ToChunk } from "#extra/extraWorldFunctions";
import { ChunkAccessError } from "#extra/errors";
import { BedrockChunk } from "./BedrockChunk.js";
import { BedrockRegistry } from "#Core/Storage/BedrockRegistry";
import { DIMENSIONS_DATA as dimData } from "#Storage/constants";

export class BedrockDimension extends BedrockPlugins {
    #id = 0
    /** @type {import("minecraft-data").IndexedData} */
    registry

    events = new EventEmitter()
    map = new BedrockMap()

    get length() { return this.map.size }
    get id() { return this.#id }
    set id(id) { if (typeof id == 'number') this.#id = id; else throw new TypeError(`Expected number, received: ${typeof id}`) }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
        return this
    }

    create(id) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        this.id = id
        return this
    }

    isYInDimensionBounds(y) {
        const { minCY = -Infinity, maxCY = Infinity } = dimData[this.id]
        return !(y > maxCY || y < minCY)
    }

    /**
     * Returns the BedrockChunk at the specified coordinates.
     * @param {number} x Chunk X
     * @param {number} z Chunk Z
     * @returns {BedrockChunk|undefined}
     */
    getChunk(x, z) {
        return this.map.getChunk(x, z)
    }

    setChunk(x, z, chunk) {
        this.map.setChunk(x, z, chunk)
    }

    createChunk(x, z) {
        const chunk = new BedrockChunk(this.registry)
        chunk.create(x, z, this.id)
        this.map.setChunk(x, z, chunk)
        return chunk
    }

    /**
     * Returns the BedrockSubChunk at the specified coordinates.
     * @param {number} x Chunk X
     * @param {number} y Chunk Y
     * @param {number} z Chunk Z
     * @returns {import("./BedrockSubChunk.js").BedrockSubChunk|undefined}
     */
    getSubChunk(x, y, z) {
        return this.getChunk(x, z)?.getSubChunk(y)
    }

    /**
     * Returns the full class of the block at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {import("./BedrockBlock.js").BedrockBlock|undefined}
     */
    getBlock(x, y, z) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) return undefined

        return chunk.getBlock(x & 15, y, z & 15)
    }
    /**
     * Set block at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @throws {ChunkAccessError}
     */
    setBlock(x, y, z, block) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${x >> 4}, ${z >> 4} is not loaded, cannot write block data.`)

        chunk.setBlock(x & 15, y, z & 15, block)
        this.events.emit('blockUpdate', { x, y, z })
    }

    /**
     * Returns RuntimeId of the block at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} [l=0] - Layer of block id
     * @returns {number|undefined}
     */
    getBlockId(x, y, z, l = 0) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) return undefined

        return chunk.getBlockId(x & 15, y, z & 15, l)
    }
    setBlockId(x, y, z, l, id) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${x >> 4}, ${z >> 4} is not loaded, cannot write block data.`)

        chunk.setBlockId(x & 15, y, z & 15, l, id)
        this.events.emit('blockUpdate', { x, y, z })
    }

    getBlockEntity(x, y, z) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) return undefined

        return chunk.getBlockEntity(x & 15, y, z & 15)
    }
    hasBlockEntity(x, y, z) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) return undefined

        return chunk.hasBlockEntity(x & 15, y, z & 15)
    }
    setBlockEntity(x, y, z, rawNBT) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${x >> 4}, ${z >> 4} is not loaded, cannot write block data.`)

        chunk.setBlockEntity(x & 15, y, z & 15, rawNBT)
        this.events.emit('blockNBTUpdate', { x, y, z })
    }
    deleteBlockEntity(x, y, z) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) return undefined

        return chunk.deleteBlockEntity(x & 15, y, z & 15)
    }

    /**
     * Returns the Biome Data from Minecraft-Data lib at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {import("minecraft-data").Biome|undefined}
     */
    getBiome(x, y, z) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) return undefined

        return chunk.getBiome(x & 15, y, z & 15)
    }

    getBiomeId(x, y, z) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) return undefined

        return chunk.getBiomeId(x & 15, y, z & 15)
    }

    setBiomeId(x, y, z, id) {
        const chunk = this.getChunk(x >> 4, z >> 4)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${x >> 4}, ${z >> 4} is not loaded, cannot write block data.`)

        chunk.setBiomeId(x & 15, y, z & 15, id)
        this.events.emit('biomeUpdate', { x, y, z })
    }

    /**
     * Returns generator with all the blocks in the area.
     * @param {{x, y, z}} from - World coordinates of area angle.
     * @param {{x, y, z}} to - World coordinates of area angle.
     */
    getBlocks(from, to) {
        const min = {
            x: Math.min(from.x, to.x),
            y: Math.min(from.y, to.y),
            z: Math.min(from.z, to.z)
        }
        const max = {
            x: Math.max(from.x, to.x),
            y: Math.max(from.y, to.y),
            z: Math.max(from.z, to.z)
        }
        const getBlock = (x, y, z) => this.getBlock(x, y, z)

        return (function* () {
            for (let y = min.y; y <= max.y; y++) {
                for (let x = min.x; x <= max.x; x++) {
                    for (let z = min.z; z <= max.z; z++) {
                        yield getBlock(x, y, z)
                    }
                }
            }
        })()
    }

    /**
     * Efficient method for searching data inside the world.
     * @param {(targetBlockMetadata: import("minecraft-data").Block) => Boolean} callBack - Callback for searching data.
     * @param {{ x, y, z }} from - Сoordinates of the search angle.
     * @param {{ x, y, z }} to - Сoordinates of the search angle.
     */
    findBlocks(callBack, from, to) {
        const min = {
            x: Math.min(from.x, to.x),
            y: Math.min(from.y, to.y),
            z: Math.min(from.z, to.z)
        }
        const max = {
            x: Math.max(from.x, to.x),
            y: Math.max(from.y, to.y),
            z: Math.max(from.z, to.z)
        }

        const minSubChunk = V3ToChunk(min.x, min.y, min.z)
        const maxSubChunk = V3ToChunk(max.x, max.y, max.z)

        const result = new Set()
        const targetIds = new Set()
        const getBlock = (x, y, z) => this.getBlock(x, y, z)

        for (const id in this.registry.blocksByRuntimeId) {
            const value = this.registry.blocksByRuntimeId[id]
            if (!(value?.id)) continue
            if (callBack(value)) targetIds.add(Number(id))
        }

        for (let y = minSubChunk.y; y <= maxSubChunk.y; y++) {
            for (let x = minSubChunk.x; x <= maxSubChunk.x; x++) {
                for (let z = minSubChunk.z; z <= maxSubChunk.z; z++) {
                    const subChunk = this.getSubChunk(x, y, z)
                    if (!subChunk?.hasBlocks) continue
                    const subChunkCoords = subChunk.from

                    for (const storage of subChunk.blocks) {
                        const localResult = storage.search(targetIds)
                        if (!localResult) continue

                        for (let i = 0; i < localResult.length; i++) {
                            const [ x, y, z ] = unpackChunkV3(localResult[i])
                            const worldX = subChunkCoords.x + x
                            const worldY = subChunkCoords.y + y
                            const worldZ = subChunkCoords.z + z

                            if (
                                worldX >= min.x && worldX <= max.x &&
                                worldY >= min.y && worldY <= max.y &&
                                worldZ >= min.z && worldZ <= max.z
                            ) result.add(packV3(worldX, worldY, worldZ))
                        }
                    }
                }
            }
        }

        const iterator = (function* () {
            for (const packedV3 of result) {
                const { x, y, z } = unpackV3(packedV3)
                yield getBlock(x, y, z)
            }
        })()
        iterator.length = result.size
        return iterator
    }
}