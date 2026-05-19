import { ChunkToV3, getIndexV2, isV2, V2, V3 } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";
import { BedrockBiomeSection, BedrockProxyBiomeSection } from "./BaseBedrockBiome.js";
import { BedrockSubChunk } from "./BaseBedrockSubChunk.js";

export class BedrockChunk extends BedrockObjectStorage {
    #position = V2(0, 0)
    dimension = 0

    #border = {}
    #biomes = {}
    #SubChunks = {}

    constructor(protocol = undefined, registry = undefined) {
        super(protocol, registry)
    }

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
        this.protocol.parsers.Chunk.buildChunk(chunkPacket, this, BlobsManager)
    }
    create(x, z, dimension) {
        this.dimension = dimension
        this.position = V2(x, z)
    }

    get subChunks() {
        return this.#SubChunks
    }
    get biomes() {
        return this.#biomes
    }

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
        let subChunk = this.#SubChunks[y]
        if (subChunk) return subChunk
        if (!subChunk && autoCreate) this.createSubChunk(y)

        return this.#SubChunks[y]
    }
    /**
     * Create and return empty subchunk if it located within Y coordinate of dimension.
     * @param {Number} y - Y coordinate of subchunk
     * @returns {BedrockSubChunk}
     */
    createSubChunk(y) {
        const { minCY, maxCY } = this.protocol.constants.dimensions[this.metadata.dimension]
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
    setSubChunk(y, bedrockSubChunk) {
        if (bedrockSubChunk instanceof BedrockSubChunk) this.#SubChunks[y] = bedrockSubChunk
        else throw new TypeError(`BedrockSubChunk classes only!`)
    }
    
    /**
     * 
     * @param {Number} y 
     * @returns {BedrockBiomeSection}
     */
    getBiomeSection(y, autoCreate = true) {
        let biomeSection = this.#biomes[y]
        if (biomeSection instanceof BedrockBiomeSection) return biomeSection
        if (biomeSection instanceof BedrockProxyBiomeSection) this.setBiomeSection(y, biomeSection.create(y))
        if (!biomeSection && autoCreate) this.createBiomeSection(y)
        
        return this.#biomes[y]
    }
    createBiomeSection(y) {
        const { minCY, maxCY } = this.protocol.constants.dimensions[this.metadata.dimension]
        if (
            maxCY !== undefined && y > maxCY ||
            minCY !== undefined && y < minCY
        ) return false

        const biomeSection = new BedrockBiomeSection(undefined, this.protocol, this.registry)
        biomeSection.position = { ...this.position, y }

        this.setBiomeSection(y, biomeSection)
        return biomeSection
    }
    setBiomeSection(y, bedrockBiomeSection) {
        this.#biomes[y] = bedrockBiomeSection
    }

    setBorder(x, z, boolean) {
        this.#border[getIndexV2(x, z)] = boolean
    }
    getBorder(x, z) {
        return this.#border[getIndexV2(x, z)]
    }

    getBiomeData(x, y, z) {
        const biomeSection = this.getBiomeSection(y >> 4)
        return biomeSection.getBiomeData(x, y & 0xF, z)
    }
    setBiomeId(x, y, z, id) {
        const biomeSection = this.getBiomeSection(y >> 4)
        return biomeSection.setBiomeId(x, y & 0xF, z)
    }

    getBlock(x, y, z) {
        const subChunk = this.getSubChunk(y >> 4)
        return subChunk.getBlock(x, y & 0xF, z)
    }
    setBlock(block, x, y, z) {
        const subChunk = this.getSubChunk(y >> 4)
        return subChunk.setBlock(block, x, y & 0xF, z)
    }

    getBlockId(x, y, z, l) {
        return this.getSubChunk(y >> 4)?.getBlockId(x, y & 0xF, z, l)
    }
    setBlockId(x, y, z, l, id) {
        this.getSubChunk(y >> 4)?.setBlockId(x, y & 0xF, z, l, id)
    }

    get hasBiomes() {
        return Object.keys(this.#biomes).length > 0
    }

    get hasSubChunks() {
        return Object.keys(this.subChunks).length > 0
    }
}