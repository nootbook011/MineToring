import { BlockAccessError } from "#extra/errors";
import { ChunkToV3, isV2, V2, V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { BedrockProtocol, ProtocolLoader } from "#Main/Packets/ProtocolLoader";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";
import { BedrockBlock } from "./BaseBedrockBlock.js";
import { BedrockSubChunk } from "./BaseBedrockSubChunk.js";

export class BedrockChunk extends BedrockObjectStorage {
    #position = V2(0, 0)
    get position() { return this.#position }
    set position(v2) {
        if (isV2(v2)) return this.#position = v2
        else return false
    }

    #protocol
    /**
     * @type {import("minecraft-data").IndexedData}
     */
    #registry

    get #parser() { return this.#protocol.parsers.Chunk }

    #biomes = {}
    #SubChunks = {}

    async initProtocol(protocol = undefined, version = undefined) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else if (version) this.#protocol = await ProtocolLoader.getProtocol(version)
        else return
    }
    initRegistry(registry = undefined, version = undefined) {
        if (!registry && this.#protocol && version) {
            this.#registry = new this.#protocol.BedrockRegistry(version)
            this.#registry.loadRuntimeIds()
        }
        else this.#registry = registry
    }

    read(chunkPacket) {
        this.#parser.buildChunk(chunkPacket, this)
    }
    create(x, z, dimension) {
        this.#parser.createChunk(V2(x, z), dimension, this)
    }

    get subChunks() {
        return this.#SubChunks
    }
    get biomes() {
        return this.#biomes
    }

    get maxY() {
        return Math.max(...Object.keys(this.#SubChunks))
    }
    get minY() {
        return Math.min(...Object.keys(this.#SubChunks))
    }

    /**
     * decodes new payload of data using a special function that is automatically adjusted to a specific version.
     */
    setPayload(payload) {
        if (payload?.length > 1) this.#parser.updatePayload(payload, this)
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
        this.#createSubChunk(y)

        return this.#SubChunks[y]
    }
    #createSubChunk(y) {
        const { minCY, maxCY } = this.#protocol.constants
        if (
            maxCY !== undefined && y > maxCY ||
            minCY !== undefined && y < minCY
        ) return false

        const parser = this.#protocol.parsers.Subchunk
        const subChunk = new BedrockSubChunk(parser.chunkMetadataToSubChunk(this.metadata, y))
        subChunk.setPayload = function (payload) {
            return parser.updatePayload(payload, this)
        }
        this.#SubChunks[y] = subChunk
    }
    setSubChunk(y, bedrockSubChunk) {
        if (bedrockSubChunk instanceof BedrockSubChunk) {
            this.#SubChunks[y] = bedrockSubChunk
            return true
        }
        else return false
    }

    getBiomeId(y) {
        return this.#biomes[y]
    }
    setBiomeId(y, bedrockBiomeSection) {
        this.#biomes[y] = bedrockBiomeSection
    }

    getBlock(x, y, z) {
        const local = V2(x, z)
        const subChunk = this.getSubChunk(y >> 4)
        const runId = subChunk.getBlockId(local.x, y & 0xF, local.z, 0)

        const metadata = runId ? this.#registry.blocksByRuntimeId[runId] : this.#registry.blocksByName.air
        const states = runId ? this.#registry.blockStates[metadata?.stateId]?.states : undefined
        const block = new BedrockBlock(metadata, states)

        const chunkPos = ChunkToV3(this.position)
        block.position = { x: chunkPos.x + x, y: chunkPos.y + y, z: chunkPos.z + z }
        if (runId) {
            block.addExtraLayer(this.#registry.blocksByRuntimeId[subChunk.getBlockId(local.x, local.y, local.z, 1)]?.name)
            block.addEntityData(subChunk.getBlockEntity(local.x, local.y, local.z))
        }

        return block
    }

    getBlockId(x, y, z, l) {
        const subChunkY = y >> 4
        return this.getSubChunk(subChunkY)?.getBlockId(x, y & 0xF, z, l)
    }
    setBlockId(x, y, z, l, id) {
        const subChunkY = y >> 4
        this.getSubChunk(subChunkY)?.setBlockId(x, y & 0xF, z, l, id)
    }

    get hasBiomes() {
        return Object.keys(this.#biomes).length > 0
    }

    get hasSubChunks() {
        return Object.keys(this.subChunks).length > 0
    }
}