import { PalettedStorage, ProxyPalettedStorage } from "#Base/BedrockStorage/Binary/PalettedStorage";
import { ChunkToV3, getIndexV2, isV2, V2, V3 } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";
import { BedrockSubChunk } from "./BaseBedrockSubChunk.js";

export class BedrockChunk extends BedrockObjectStorage {
    #position = V2(0, 0)
    dimension = 0

    #border = {}
    #biomes = {}
    #subChunks = {}

    get position() { return this.#position }
    set position(v2) {
        if (isV2(v2)) return this.#position = v2
        else return false
    }

    get from() {
        const { minCY } = this.protocol.constants.dimensions[this.dimension]
        return ChunkToV3(V3(this.position.x, minCY, this.position.z))
    }
    get to() {
        const { maxCY } = this.protocol.constants.dimensions[this.dimension]
        const to = ChunkToV3(V3(this.position.x, maxCY, this.position.z))
        return V3(
            to.x + 15,
            to.y + 15,
            to.z + 15
        )
    }

    buildFromPacket(chunkPacket, BlobsManager = undefined) {
        const parser = this.protocol.parsers.Chunk
        if (!parser) throw new Error(`Cannot load Chunk parser!`)

        parser.buildChunk(chunkPacket, this, BlobsManager)
    }
    create(x, z, dimension) {
        if (!this.protocol || !this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        this.dimension = dimension
        this.position = V2(x, z)
    }

    get subChunks() { return this.#subChunks }
    get biomes() { return this.#biomes }

    get hasBiomes() { return Object.keys(this.#biomes).length > 0 }
    get hasSubChunks() { return Object.keys(this.#subChunks).length > 0 }
    
    /**
     * Decodes payload data sent over the bedrock protocol
     * @param {Array} payload 
     * @param {Boolean} cache payload data cached or not
     * @returns {Boolean}
     */
    setPayload(payload, cache) {
        const decoder = this.protocol.decoders.ChunkDecoder
        if (!decoder) throw new Error(`Cannot load ChunkDecoder`)

        if (payload?.length > 1) {
            decoder.decodeNetwork(this, payload, cache)
            return true
        }
        else return false
    }
    setBorderBlocksPayload(payload) {
        const decoder = this.protocol.decoders.ChunkDecoder
        if (!decoder) throw new Error(`Cannot load ChunkDecoder`)

        if (payload?.length > 1) {
            decoder.decodeBorderBlocks(this, payload)
            return true
        }
        else return false
    }

    /**
     * Returns a subchunk class in the Y column. If it is missing and located within Y coordinate of dimension, it creates a new empty subchunk and returns it.
     * @param {Number} y - Y coordinate of subchunk
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
     * @param {Number} y - Y coordinate of subchunk
     * @returns {BedrockSubChunk}
     */
    createSubChunk(y) {
        const { minCY, maxCY } = this.protocol.constants.dimensions[this.dimension]
        if (
            maxCY !== undefined && y > maxCY ||
            minCY !== undefined && y < minCY
        ) return false

        const { x, z } = this.position
        const subChunk = new BedrockSubChunk(this.protocol, this.registry)
        subChunk.create(x, y, z, this.dimension)
        this.setSubChunk(y, subChunk)

        return subChunk
    }
    setSubChunk(y, subChunk) {
        if (subChunk instanceof BedrockSubChunk) this.#subChunks[y] = subChunk
        else throw new TypeError(`BedrockSubChunk classes only!`)
    }
    
    /**
     * 
     * @param {Number} y 
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

    getBorder(x, z) { return this.#border[getIndexV2(x, z)] }
    setBorder(x, z, boolean) { this.#border[getIndexV2(x, z)] = boolean }

    getBiome(x, y, z) { return this.registry.biomes[this.getBiomeId(x, y, z)] }

    getBiomeId(x, y, z) { return this.getBiomeSection(y >> 4).get(x, y & 0xF, z) }
    setBiomeId(x, y, z, id) { return this.getBiomeSection(y >> 4).set(x, y & 0xF, z, id) }

    getBlock(x, y, z) { return this.getSubChunk(y >> 4).getBlock(x, y & 0xF, z) }
    setBlock(block, x, y, z) { return this.getSubChunk(y >> 4).setBlock(block, x, y & 0xF, z) }

    getBlockId(x, y, z, l) { return this.getSubChunk(y >> 4)?.getBlockId(x, y & 0xF, z, l) }
    setBlockId(x, y, z, l, id) { this.getSubChunk(y >> 4)?.setBlockId(x, y & 0xF, z, l, id) }
}