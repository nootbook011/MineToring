import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { EventEmitter } from 'node:events'
import { BedrockMap } from "../Storage/Maps/BedrockMap.js"
import { BlocksIterator } from "../Storage/BedrockBlocks.js";
import { BedrockThread } from "#Storage/BedrockThread";
import { packV3, V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { ChunkAccessError } from "#extra/errors";
import { BedrockChunk } from "./Objects/BedrockChunk.js";
import { BedrockRegistry } from "#Core/Storage/BedrockRegistry";
import constants from "#Core/Storage/constants";

export class BedrockDimension extends BedrockPlugins {
    id = 0
    /** @type {import("minecraft-data").IndexedData} */
    registry

    events = new EventEmitter()
    map = new BedrockMap()

    get length() { return this.chunks.size }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
    }

    create(dimensionId) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        this.id = dimensionId
    }

    isYInDimensionBounds(y) {
        const { minCY = Infinity, maxCY = Infinity } = constants.dimensions[this.id]
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

    /**
     * Returns the BedrockSubChunk at the specified coordinates.
     * @param {number} x Chunk X
     * @param {number} y Chunk Y
     * @param {number} z Chunk Z
     * @returns {import("./Objects/BedrockSubChunk.js").BedrockSubChunk|undefined}
     */
    getSubChunk(x, y, z) {
        return this.getChunk(x, z)?.getSubChunk(y)
    }

    /**
     * Returns the full class of the block at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {import("./Objects/BedrockBlock.js").BedrockBlock|undefined}
     */
    getBlock(x, y, z) {
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) return undefined

        const local = V3WorldToLocal(v3)
        return chunk.getBlock(local.x, y, local.z)
    }
    /**
     * Set block at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @throws {ChunkAccessError}
     */
    setBlock(block, x, y, z) {
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${coords.x}, ${coords.z} is not loaded, cannot write block data.`)

        const local = V3WorldToLocal(v3)
        return chunk.setBlock(block, local.x, y, local.z)
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
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) return undefined

        const local = V3WorldToLocal(v3)
        return chunk.getBlockId(local.x, y, local.z, l)
    }

    /**
     * Returns an iterator with all the blocks in the area.
     * @param {{x, y, z}} from - World coordinates of area angle.
     * @param {{x, y, z}} to - World coordinates of area angle.
     */
    getBlocks(from, to) {
        const thread = new BedrockThread()
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

        for (let y = min.y; y <= max.y; y++) {
            for (let x = min.x; x <= max.x; x++) {
                for (let z = min.z; z <= max.z; z++) {
                    thread.add(packV3(x, y, z))
                }
            }
        }

        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), thread)
    }

    /**
     * Efficient method for searching data inside the world.
     * @param {(targetBlockMetadata: import("minecraft-data").Block) => Boolean} callBack - Callback for searching data.
     * @param {{ x, y, z }} from - Сoordinates of the search angle.
     * @param {{ x, y, z }} to - Сoordinates of the search angle.
     * @param {{ skipChunkAccessErrors: true, searchInChunks: false, }} [options={}] - Options for search.
     * @throws {ChunkAccessError}
     * @returns {BlocksIterator}
     */
    findBlocks(callBack, from, to, options = {}) {
        const {
            skipChunkAccessErrors = true,
            searchInChunks = false,
        } = options || {}

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

        const minSubChunk = searchInChunks ? min : V3ToChunk(min)
        const maxSubChunk = searchInChunks ? max : V3ToChunk(max)

        const result = new BedrockThread()
        const targetIds = new Set()

        for (const id in this.registry.blocksByRuntimeId) {
            const value = this.registry.blocksByRuntimeId[id]
            if (!(value?.id)) continue
            if (callBack(value)) targetIds.add(Number(id))
        }

        for (let y = minSubChunk.y; y <= maxSubChunk.y; y++) {
            for (let x = minSubChunk.x; x <= maxSubChunk.x; x++) {
                for (let z = minSubChunk.z; z <= maxSubChunk.z; z++) {
                    const chunk = this.getChunk(x, z)
                    if (!chunk) {
                        if (!skipChunkAccessErrors) throw new ChunkAccessError(`Chunk at ${x}, ${z} is not loaded or corrupted, cannot load block data.`)
                        continue
                    }
                    const subChunk = chunk.getSubChunk(y)
                    if (!subChunk || !subChunk.hasBlocks()) continue
                    const subChunkWorldCoords = subChunk.from

                    for (const storage of subChunk.blocks) {
                        const palette = storage.palette
                        const localTargetIndices = new Uint8Array(palette.length)

                        for (let i = 0; i < palette.length; i++) {
                            if (targetIds.has(palette[i])) localTargetIndices[i] = true
                        }

                        if (!localTargetIndices.length) continue

                        storage.forEach((index, offset, i) => {
                            const pindex = storage.readBits(index, offset)
                            const y = i & 0xf
                            const z = (i >> 4) & 0xf
                            const x = (i >> 8) & 0xf

                            if (localTargetIndices[pindex]) {
                                const worldX = subChunkWorldCoords.x + x
                                const worldY = subChunkWorldCoords.y + y
                                const worldZ = subChunkWorldCoords.z + z

                                if (
                                    searchInChunks ||
                                    worldX >= min.x && worldX <= max.x &&
                                    worldY >= min.y && worldY <= max.y &&
                                    worldZ >= min.z && worldZ <= max.z
                                ) result.add(packV3(worldX, worldY, worldZ))
                            }
                        })
                    }
                }
            }
        }

        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), result)
    }

    /**
     * Returns the Biome Data from Minecraft-Data lib at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {import("minecraft-data").Biome|undefined}
     */
    getBiome(x, y, z) {
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) return undefined

        const local = V3WorldToLocal(v3)
        return chunk.getBiome(local.x, y, local.z)
    }

    /**
     * Adds a chunk packet to the dimension, it will automatically parse it and add to the map.
     * @param {object} levelChunkPacket 
     * @returns {BedrockChunk} the added chunk
     */
    addChunk(chunkPacket) {
        const bedrockMap = this.map

        const BChunk = new BedrockChunk(this.registry)
        BChunk.buildFromPacket(chunkPacket, this.plugins?.BlobsManager)
        bedrockMap.setChunk(BChunk, BChunk.position.x, BChunk.position.z)

        return BChunk
    }

    /**
     * Adds subchunk packets to the dimension, it will automatically parse them and add to the map, it requires the chunk to be already added to the map.
     * @param {object} subChunkPacket 
     */
    addSubChunks(subChunkPacket) {
        const { entries, origin, cache_enabled: cache } = subChunkPacket
        let chunk

        for (const entry of entries) {
            const pos = V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
            if (chunk?.position?.x !== pos.x || chunk?.position?.z !== pos.z) {
                chunk = this.map.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }

            const { payload, heightmap, result, blob_id: hash } = entry
            const BSubChunk = chunk.createSubChunk(pos.y)

            if (cache) BSubChunk.setBlocksEntityPayload(payload)
            else BSubChunk.setPayload(payload, cache)

            if (cache && this.plugins.BlobsManager && result === 'success') this.plugins.BlobsManager.addHash(hash, BSubChunk)
        }
    }
}