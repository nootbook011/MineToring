import { PalettedStorage, ProxyPalettedStorage } from "#Storage/Binary/PalettedStorage";
import { ChunkToV3, isV2, packV3, unpackChunkV3, unpackV3, V2, V3 } from "#extra/extraWorldFunctions";
import { hasData } from "#extra/extraFunctions";
import { BedrockSubChunk } from "./BedrockSubChunk.js";
import { DIMENSIONS_DATA as dimData } from "#Storage/constants";
import { BedrockRegistry } from "#Storage/BedrockRegistry"
import { BedrockBlock } from "./BedrockBlock.js";

export class BedrockChunk {
    /** @type {import("minecraft-data").IndexedData} */
    registry

    #position = V2(0, 0)
    dimension = 0

    border = Array(16).fill().map(() => Array(16).fill(false))
    biomes = {}
    subChunks = {}

    get position() { return this.#position }
    set position(v2) {
        if (isV2(v2)) {
            this.#position.x = v2.x
            this.#position.z = v2.z
        }
        else throw new TypeError(`Expected V2 Object, received: ${typeof v2}`)
    }

    get from() {
        const { minCY } = dimData[this.dimension]
        return ChunkToV3(this.position.x, minCY, this.position.z)
    }
    get to() {
        const { maxCY } = dimData[this.dimension]
        const to = ChunkToV3(this.position.x, maxCY, this.position.z)
        return V3(
            to.x + 15,
            to.y + 15,
            to.z + 15
        )
    }

    constructor(registryOrVersion) {
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
        return this
    }

    create(x, z, dimension) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        this.dimension = dimension
        this.position = V2(x, z)
        return this
    }

    get hasBiomes() { return hasData(this.biomes) }
    get hasSubChunks() { return hasData(this.subChunks) }

    /**
     * Efficient method for searching data inside the chunk.
     * @param {(targetBlockMetadata: import("minecraft-data").Block) => Boolean} callBack
     */
    findBlocks(callBack) {
        const result = new Set()
        const targetIds = new Set()
        const getBlock = (x, y, z) => this.getBlock(x, y, z)

        for (const id in this.registry.blocksByRuntimeId) {
            const value = this.registry.blocksByRuntimeId[id]
            if (!(value?.id)) continue
            if (callBack(value)) targetIds.add(Number(id))
        }

        for (const y in this.subChunks) {
            const subChunk = this.getSubChunk(y)
            if (!subChunk?.hasBlocks) continue
            const subChunkCoords = subChunk.from

            for (const storage of subChunk.blocks) {
                const localResult = storage.search(targetIds)
                if (!localResult) continue

                for (let i = 0; i < localResult.length; i++) {
                    const [ x, y, z ] = unpackChunkV3(localResult[i])
                    result.add(packV3(x, subChunkCoords.y + y, z))
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

    /**
     * Returns a subchunk class in the Y column. If it is missing and located within Y coordinate of dimension, it creates a new empty subchunk and returns it.
     * @param {number} y - Y coordinate of subchunk
     * @returns {BedrockSubChunk}
     */
    getOrCreateSubChunk(y) {
        return this.getSubChunk(y) ?? this.createSubChunk(y)
    }
    /**
     * Create and return empty subchunk.
     * @param {number} y - Y coordinate of subchunk
     * @returns {BedrockSubChunk}
     */
    createSubChunk(y) {
        const { x, z } = this.position
        const subChunk = new BedrockSubChunk(this.registry)
        subChunk.create(x, y, z, this.dimension)
        this.setSubChunk(y, subChunk)

        return subChunk
    }

    /**
     * Returns a SubChunk class in the Y column.
     * @param {number} y - Y coordinate of SubChunk.
     * @returns {BedrockSubChunk|undefined}
     */
    getSubChunk(y) {
        return this.subChunks[y]
    }
    /**
     * Set SubChunk class to Y column.
     * @param {number} y - Y coordinate of SubChunk.
     * @param {BedrockSubChunk} subChunk
     */
    setSubChunk(y, subChunk) {
        if (!(subChunk instanceof BedrockSubChunk)) throw new TypeError(`Expected BedrockSubChunk class, received: ${typeof subChunk}`)
        this.subChunks[y] = subChunk
    }


    /**
     * @param {number} y 
     * @returns {PalettedStorage}
     */
    getOrCreateBiomeSection(y) {
        return this.getBiomeSection(y) ?? this.createBiomeSection(y)
    }
    /**
     * @param {number} y 
     * @returns {PalettedStorage}
     */
    createBiomeSection(y) {
        this.biomes[y] = new PalettedStorage().create()
        return this.biomes[y]
    }

    /**
     * @param {number} y 
     * @returns {PalettedStorage|undefined}
     */
    getBiomeSection(y, lazy = false) {
        if (!lazy && this.biomes[y] instanceof ProxyPalettedStorage) this.biomes[y] = this.biomes[y].create()
        return this.biomes[y]
    }
    /**
     * @param {number} y 
     */
    setBiomeSection(y, biomeSection) {
        if (!(
            biomeSection instanceof PalettedStorage ||
            biomeSection instanceof ProxyPalettedStorage
        )) throw new TypeError(`Expected PalettedStorage or ProxyPalettedStorage, received: ${typeof biomeSection}`)

        this.biomes[y] = biomeSection
    }

    /** @returns {boolean} */
    getBorder(x, z) { return this.border[x][z] }
    setBorder(x, z, boolean) { this.border[x][z] = boolean }

    /**
     * Returns the Biome Data from Minecraft-Data lib at the chunk local coordinates
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns 
     */
    getBiome(x, y, z) { return this.registry.biomes[this.getBiomeId(x, y, z)] }

    getBiomeId(x, y, z) { return this.getBiomeSection(y >> 4, true)?.get(x, y & 0xF, z) }
    setBiomeId(x, y, z, id) { return this.getOrCreateBiomeSection(y >> 4).set(x, y & 0xF, z, id) }

    getBlock(x, y, z) {
        const subChunk = this.getSubChunk(y >> 4)
        if (!subChunk) {
            const pos = this.from
            const block = new BedrockBlock(this.registry)
            block.position = { x: pos.x + x, y, z: pos.z + z }
            return block
        }

        return subChunk.getBlock(x, y & 0xF, z)
    }
    setBlock(x, y, z, block) { return this.getOrCreateSubChunk(y >> 4).setBlock(x, y & 0xF, z, block) }

    getBlockId(x, y, z, l) { return this.getSubChunk(y >> 4)?.getBlockId(x, y & 0xF, z, l) ?? 0 }
    setBlockId(x, y, z, l, id) { this.getOrCreateSubChunk(y >> 4).setBlockId(x, y & 0xF, z, l, id) }

    getBlockEntity(x, y, z) { return this.getSubChunk(y >> 4)?.getBlockEntity(x, y & 0xF, z) }
    hasBlockEntity(x, y, z) { return this.getSubChunk(y >> 4)?.hasBlockEntity(x, y & 0xF, z) }
    deleteBlockEntity(x, y, z) { return this.getSubChunk(y >> 4)?.deleteBlockEntity(x, y & 0xF, z) }
    setBlockEntity(x, y, z, rawNBT) { this.getOrCreateSubChunk(y >> 4).setBlockEntity(x, y & 0xF, z, rawNBT) }
}