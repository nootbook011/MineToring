import { BedrockMap } from "#Storage/BaseBedrockMap"
import { EventEmitter } from 'node:events'
import { simplify } from "prismarine-nbt";

import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockProtocol, ProtocolLoader } from "#Main/Packets/ProtocolLoader";
import { V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { DimensionAccessError } from "#extra/errors";
import { BedrockBlock } from "./bedrockObjects/BaseBedrockBlock.js";

export class BedrockDimension extends BedrockPlugins {
    #protocol
    /**
     * @type {import("minecraft-data").IndexedData}
     */
    #registry
    #events = new EventEmitter()
    #map

    get #db() { return this.#protocol.parsers }

    get events() { return this.#events }
    get chunks() { return this.#map }
    get length() { return this.chunks.size }

    constructor() {
        super()
        this.#map = new BedrockMap()
    }

    async initProtocol(protocol = undefined, autoInit = true) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else if (autoInit) this.#protocol = await ProtocolLoader.getProtocol(this.version)
        else return
    }

    initRegistry(registry) {
        this.#registry = registry
    }

    _clear() {
        this.#map.clear()
    }

    /**
     * Retrieves the BedrockChunk at the specified coordinates.
     * @param {Number} x Chunk X
     * @param {Number} z Chunk Z
     * @returns {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk}
     */
    getChunk(x, z) {
        const Dmap = this.#map

        const BChunk = Dmap.getChunk(x, z)
        return BChunk
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @param {Number} full 
     * @returns {BedrockBlock}
     */
    getBlock(x, y, z, full = true) {
        const v3Data = V3(x, y, z)
        const coords = V3ToChunk(v3Data)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk || !chunk.hasPayload || !chunk.hasSubChunks) throw new DimensionAccessError(`Chunk at ${x}, ${y}, ${z} is not loaded or corrupted, cannot load block data.`)

        const local = V3WorldToLocal(v3Data)
        const staticData = this.#registry.blocksByRuntimeId[chunk.getBlockId(local.x, v3Data.y, local.z, 0)]
        const block = new BedrockBlock({ ...staticData })

        if (full) {
            block.addStates(simplify({ type: 'compound', value: { ...this.#registry.blockStates[staticData.stateId].states } }))
            block.addExtraLayer({ ...this.#registry.blocksByRuntimeId[chunk.getBlockId(local.x, v3Data.y, local.z, 1)] })
            block.addEntityData({ ...chunk.getSubChunk(coords.y).getBlockEntity(x, y, z) })
        }

        return block
    }

    /**
     * Adds packets to the dimension, it can be WorldPackets like level_chunk and subchunk, it will automatically parse them and add to the map.
     * @param {{ chunk: Object, subChunks: Object }} packets 
     */
    add(packets) {
        const { chunk, subChunks } = packets

        if (chunk) this.addChunk(chunk)
        if (subChunks) this.addSubChunks(subChunks)
    }

    /**
     * Adds a level chunk packet to the dimension, it will automatically parse it and add to the map.
     * @param {Object} levelChunkPacket 
     * @returns {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk} the added chunk
     */
    addChunk(levelChunkPacket) {
        const parser = this.#db.Chunk
        const bedrockMap = this.#map
        const blobsManager = this.plugins?.BlobsManager
        const BChunk = parser.buildChunk(levelChunkPacket, bedrockMap, blobsManager)

        return BChunk
    }

    /**
     * Adds subchunk packets to the dimension, it will automatically parse them and add to the map, it requires the chunk to be already added to the map.
     * @param {Object} subChunkPacket 
     */
    addSubChunks(subChunkPacket) {
        const parser = this.#db.Subchunk
        const bedrockMap = this.#map
        const blobsManager = this.plugins?.BlobsManager
        parser.buildSubChunks(subChunkPacket, bedrockMap, blobsManager)
    }
}