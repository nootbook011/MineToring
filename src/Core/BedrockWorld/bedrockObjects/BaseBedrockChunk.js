import { BlockAccessError } from "#extra/errors";
import { ChunkToV3, isV2, V2, V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";
import { BedrockBlock } from "./BaseBedrockBlock.js";
import { BedrockSubChunk } from "./BaseBedrockSubChunk.js";

/**
 * @extends {BedrockObjectStorage<{dimension: number, cache: boolean, hash: bigint}>}
 */
export class BedrockChunk extends BedrockObjectStorage {
    #position = V2(0, 0)

    get #parser() { return this.protocol.parsers.Chunk }

    #biomes = {}
    #SubChunks = {}

    constructor (metadata = undefined) {
        super({
            dimension: 0,
            cache: false,
            hash: 0n,
        })
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

    /**
     * decodes new payload of data using a special function that is automatically adjusted to a specific version.
     */
    setPayload(payload) {
        const decoder = this.protocol.decoders.ChunkDecoder
        if (!decoder) throw new Error(`Cannot load ChunkDecoder`)
        
        if (payload?.length > 1) decoder.decodeNetwork(this, payload, this.metadata.cache)
        else return false
    }

    /**
     * 
     * @param {Number} y 
     * @returns {BedrockSubChunk}
     */
    getSubChunk(y) {
        let subChunk = this.#SubChunks[y]
        if (subChunk) return subChunk
        this.createSubChunk(y)

        return this.#SubChunks[y]
    }
    createSubChunk(y) {
        const { minCY, maxCY } = this.protocol.constants
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
        const subChunk = new BedrockSubChunk(subMetadata)
        subChunk.init(this.protocol, this.registry)
        subChunk.position = V3(this.position.x, y, this.position.z)

        this.#SubChunks[y] = subChunk
        return subChunk
    }
    setSubChunk(y, bedrockSubChunk) {
        if (bedrockSubChunk instanceof BedrockSubChunk) {
            this.#SubChunks[y] = bedrockSubChunk
            return true
        }
        else return false
    }

    getBiomeSection(y) {
        return this.#biomes[y]
    }
    setBiomeSection(y, bedrockBiomeSection) {
        this.#biomes[y] = bedrockBiomeSection
    }

    getBlock(x, y, z) {
        const local = V2(x, z)
        const subChunk = this.getSubChunk(y >> 4)
        const runId = subChunk.getBlockId(local.x, y & 0xF, local.z, 0)

        const metadata = runId ? this.registry.blocksByRuntimeId[runId] : this.registry.blocksByName.air
        const states = runId ? this.registry.blockStates[metadata?.stateId]?.states : undefined
        const block = new BedrockBlock(metadata, states)

        const chunkPos = ChunkToV3(this.position)
        block.position = { x: chunkPos.x + x, y: chunkPos.y + y, z: chunkPos.z + z }
        if (runId) {
            block.setExtraLayer(this.registry.blocksByRuntimeId[subChunk.getBlockId(local.x, local.y, local.z, 1)]?.name)
            block.setEntityData(subChunk.getBlockEntity(local.x, local.y, local.z))
        }

        return block
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