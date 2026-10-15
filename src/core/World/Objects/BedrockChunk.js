import { ByteStream } from "../../Storage/Binary/ByteStream.js";
import { PalettedStorage, ProxyPalettedStorage } from "../../Storage/Binary/PalettedStorage.js";
import { ChunkToV3, isV2, V2, V3 } from "#extra/extraWorldFunctions";
import { BedrockSubChunk } from "./BedrockSubChunk.js";
import constants from "../../Storage/constants.js";
import { BedrockRegistry } from "#Storage/BedrockRegistry"
import { BedrockThread } from "#Core/Storage/BedrockThread";
import { BlocksIterator } from "#Storage/BedrockBlocks";

export class BedrockChunk {
    /** @type {import("minecraft-data").IndexedData} */
    #registry

    #position = V2(0, 0)
    dimension = 0

    #border = Array(16).fill().map(() => Array(16).fill(false))
    #biomes = {}
    #subChunks = {}

    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }

    get position() { return this.#position }
    set position(v2) {
        if (isV2(v2)) return this.#position = Object.assign(this.#position, v2)
        else return false
    }

    get from() {
        const { minCY } = constants.dimensions[this.dimension]
        return ChunkToV3(V3(this.position.x, minCY, this.position.z))
    }
    get to() {
        const { maxCY } = constants.dimensions[this.dimension]
        const to = ChunkToV3(V3(this.position.x, maxCY, this.position.z))
        return V3(
            to.x + 15,
            to.y + 15,
            to.z + 15
        )
    }

    constructor(registry = undefined) {
        if (registry) this.registry = registry
    }

    init(version) {
        this.#registry = new BedrockRegistry(version)
    }

    buildFromPacket(chunkPacket, BlobsManager = undefined) {
        const { x, z, dimension, cache_enabled: cache, payload, blobs } = chunkPacket

        this.create(x, z, dimension)
        this.payloadCache = cache
        if (cache && BlobsManager) BlobsManager.addHash(blobs?.hashes, this)

        if (cache) this.setBorderBlocksPayload(payload)
        else this.setPayload(payload, cache)
    }

    create(x, z, dimension) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        this.dimension = dimension
        this.position = V2(x, z)
    }

    get subChunks() { return this.#subChunks }
    get biomes() { return this.#biomes }

    get hasBiomes() { return Object.keys(this.#biomes).length > 0 }
    get hasSubChunks() { return Object.keys(this.#subChunks).length > 0 }

    /*
    * thanks prismarine-chunk library for code reference 
    */
    /**
     * Decodes payload data sent over the bedrock protocol
     * @param {Array} payload 
     * @param {boolean} cache payload data cached status
     * @returns {boolean}
     */
    setPayload(payload, cache = this.payloadCache) {
        if (!(payload?.length > 1)) return false

        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        if (!cache && stream.peek() !== undefined) {
            return this.setBorderBlocksPayload(payload)
        }

        const { maxCY, minCY } = constants.dimensions[this.dimension]

        let proxy
        for (let y = minCY; y <= maxCY; y++) {
            if (stream.peek() === 0xff) {
                if (!proxy) throw new Error(`Cannot use last section.`)
                this.setBiomeSection(y, proxy)
                continue
            }

            const storage = new PalettedStorage()
            const paletteType = stream.readByte()
            const isRuntimeIds = (paletteType & 1) === 1
            if (!isRuntimeIds) throw new Error('This method decode only network data.')

            const bitsPerBlock = paletteType >> 1
            storage.create(bitsPerBlock)

            if (bitsPerBlock === 0) storage.palette.push(stream.readVarInt() >> 1)
            else {
                storage.read(stream)
                const paletteSize = stream.readVarInt() >> 1
                const palette = []

                for (let i = 0; i < paletteSize; i++) {
                    palette[i] = stream.readVarInt() >> 1
                }

                storage.palette = palette
            }

            this.setBiomeSection(y, storage)

            if (stream.peek() === 0xff) proxy = new ProxyPalettedStorage(storage)
        }

        return true
    }
    setBorderBlocksPayload(payload) {
        if (!(payload?.length > 1)) return false

        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        const countByte = stream.readByte()
        const count = countByte === 0 ? 256 : countByte

        for (let i = 0; i < count; i++) {
            if (stream.peek() === undefined) break

            const packedXZ = stream.readByte()
            const z = packedXZ >> 4
            const x = packedXZ & 0x0F

            this.setBorder(x, z, true)
        }

        return true
    }

    /**
     * Efficient method for searching data inside the chunk.
     * @param {(targetBlockMetadata: import("minecraft-data").Block) => Boolean} callBack
     * @returns {BlocksIterator}
     */
    findBlocks(callBack) {
        const dimConsts = constants.dimensions[this.dimension]
        const result = new BedrockThread()
        const targetIds = new Set()

        for (const id in this.registry.blocksByRuntimeId) {
            const value = this.registry.blocksByRuntimeId[id]
            if (!(value?.id)) continue
            if (callBack(value)) targetIds.add(Number(id))
        }

        for (let y = dimConsts.minCY; y <= dimConsts.maxCY; y++) {
            const subChunk = this.getSubChunk(y, false)
            if (!subChunk || !subChunk.blocks.length) continue
            const subChunkWorldCoords = subChunk.from
            const storage = subChunk.blocks[0]

            const localTargetIndices = new Uint8Array(storage.palette.length)
            let hasTargets = false

            for (let i = 0; i < storage.palette.length; i++) {
                if (targetIds.has(storage.palette[i])) {
                    localTargetIndices[i] = 1
                    hasTargets = true
                }
            }
            if (!hasTargets) continue

            storage.forEach((index, offset, i) => {
                const pindex = storage.readBits(index, offset)
                const y = i & 0xf
                const z = (i >> 4) & 0xf
                const x = (i >> 8) & 0xf

                if (localTargetIndices[pindex]) {
                    const worldX = subChunkWorldCoords.x + x
                    const worldY = subChunkWorldCoords.y + y
                    const worldZ = subChunkWorldCoords.z + z

                    result.add(packV3(worldX, worldY, worldZ))
                }
            })


        }

        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), result)
    }

    /**
     * Returns a subchunk class in the Y column. If it is missing and located within Y coordinate of dimension, it creates a new empty subchunk and returns it.
     * @param {number} y - Y coordinate of subchunk
     * @param {boolean} autoCreate - if False then returns undefined if the subchunk is missing (empty)
     * @returns {BedrockSubChunk}
     */
    getSubChunk(y, autoCreate = true) {
        let subChunk = this.#subChunks[y]
        if (subChunk) return subChunk
        if (!subChunk && autoCreate) this.createSubChunk(y)

        return this.#subChunks[y]
    }
    /**
     * Create and return empty subchunk if it located within Y coordinate of dimension.
     * @param {number} y - Y coordinate of subchunk
     * @returns {BedrockSubChunk}
     */
    createSubChunk(y) {
        const { minCY, maxCY } = constants.dimensions[this.dimension]
        if (
            maxCY !== undefined && y > maxCY ||
            minCY !== undefined && y < minCY
        ) return false

        const { x, z } = this.position
        const subChunk = new BedrockSubChunk(this.registry)
        subChunk.create(x, y, z, this.dimension)
        if (this.payloadCache) subChunk.payloadCache = this.payloadCache
        this.setSubChunk(y, subChunk)

        return subChunk
    }
    setSubChunk(y, subChunk) {
        if (subChunk instanceof BedrockSubChunk) this.#subChunks[y] = subChunk
        else throw new TypeError(`BedrockSubChunk classes only!`)
    }

    /**
     * 
     * @param {number} y 
     * @returns {PalettedStorage}
     */
    getBiomeSection(y, autoCreate = true) {
        if (this.#biomes[y] instanceof ProxyPalettedStorage) this.#biomes[y] = this.#biomes[y].create()
        if (!this.#biomes[y] && autoCreate) this.#biomes[y] = new PalettedStorage().create()

        return this.#biomes[y]
    }
    setBiomeSection(y, biomeSection) {
        if (biomeSection instanceof PalettedStorage || biomeSection instanceof ProxyPalettedStorage) this.#biomes[y] = biomeSection
        else throw new TypeError(`BiomeSection must be PalettedStorage or ProxyPalettedStorage!`)
    }

    /** @returns {boolean} */
    getBorder(x, z) { return this.#border[x][z] }
    setBorder(x, z, boolean) { this.#border[x][z] = boolean }

    /**
     * Returns the Biome Data from Minecraft-Data lib at the chunk local coordinates
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns 
     */
    getBiome(x, y, z) { return this.registry.biomes[this.getBiomeId(x, y, z)] }

    getBiomeId(x, y, z) { return this.getBiomeSection(y >> 4).get(x, y & 0xF, z) }
    setBiomeId(x, y, z, id) { return this.getBiomeSection(y >> 4).set(x, y & 0xF, z, id) }

    getBlock(x, y, z) { return this.getSubChunk(y >> 4).getBlock(x, y & 0xF, z) }
    setBlock(block, x, y, z) { return this.getSubChunk(y >> 4).setBlock(block, x, y & 0xF, z) }

    getBlockId(x, y, z, l) { return this.getSubChunk(y >> 4)?.getBlockId(x, y & 0xF, z, l) }
    setBlockId(x, y, z, l, id) { this.getSubChunk(y >> 4)?.setBlockId(x, y & 0xF, z, l, id) }
}