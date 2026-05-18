import { ChunkToV3, getIndexV2, isV2, V2, V3 } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";
import { BedrockBiomeSection, BedrockProxyBiomeSection } from "./BaseBedrockBiome.js";
import { BedrockSubChunk } from "./BaseBedrockSubChunk.js";

/**
 * @extends {BedrockObjectStorage<{dimension: number, cache: boolean, hash: bigint}>}
 */
export class BedrockChunk extends BedrockObjectStorage {
    #position = V2(0, 0)

    get #parser() { return this.protocol.parsers.Chunk }

    #border = {}
    #biomes = {}
    #SubChunks = {}

    constructor(metadata = undefined, protocol = undefined, registry = undefined) {
        super({
            dimension: 0,
            cache: false,
            hash: 0n,
        }, protocol, registry)
        if (metadata) this.setMetadata(metadata)
    }

    get position() { return this.#position }
    set position(v2) {
        if (isV2(v2)) return this.#position = v2
        else return false
    }
    get from() {
        const { minCY } = this.protocol.constants
        return ChunkToV3(V3(this.position.x, minCY, this.position.z))
    }
    get to() {
        const { maxCY } = this.protocol.constants
        const to = ChunkToV3(V3(this.position.x, maxCY, this.position.z))
        return V3(
            to.x + 15,
            to.y + 15,
            to.z + 15
        )
    }

    read(chunkPacket) {
        this.#parser.buildChunk(chunkPacket, this)
    }
    create(x, z, dimension) {
        const metadata = this.#parser.metadata()
        this.setMetadata({
            ...metadata,
            dimension
        })
        this.position = V2(x, z)
    }

    get subChunks() {
        return this.#SubChunks
    }
    get biomes() {
        return this.#biomes
    }

    setPayload(payload) {
        const decoder = this.protocol.decoders.ChunkDecoder
        if (!decoder) throw new Error(`Cannot load ChunkDecoder`)

        if (payload?.length > 1) decoder.decodeNetwork(this, payload, this.metadata.cache)
        else return false
    }
    setBorderBlocksPayload(payload) {
        const decoder = this.protocol.decoders.ChunkDecoder
        if (!decoder) throw new Error(`Cannot load ChunkDecoder`)

        if (payload?.length > 1) decoder.decodeBorderBlocks(this, payload)
        else return false
    }

    /**
     * 
     * @param {Number} y 
     * @returns {BedrockSubChunk}
     */
    getSubChunk(y, autoCreate = true) {
        let subChunk = this.#SubChunks[y]
        if (subChunk) return subChunk
        if (!subChunk && autoCreate) this.createSubChunk(y)

        return this.#SubChunks[y]
    }
    createSubChunk(y) {
        const { minCY, maxCY } = this.protocol.constants.dimensions[this.metadata.dimension]
        if (
            maxCY !== undefined && y > maxCY ||
            minCY !== undefined && y < minCY
        ) return false

        const parser = this.protocol.parsers.Subchunk
        const subMetadata = {
            ...parser.metadata(),
            ...this.metadata,
            hash: 0n
        }
        const subChunk = new BedrockSubChunk(subMetadata, this.protocol, this.registry)
        subChunk.position = { ...this.position, y }

        this.setSubChunk(y, subChunk)
        return subChunk
    }
    setSubChunk(y, bedrockSubChunk) {
        this.#SubChunks[y] = bedrockSubChunk
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