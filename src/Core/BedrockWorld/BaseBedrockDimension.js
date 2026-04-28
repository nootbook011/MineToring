import { BedrockMap } from "#Storage/BaseBedrockMap"
import { EventEmitter } from 'node:events'

import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockProtocol, ProtocolLoader } from "#Main/Packets/ProtocolLoader";

export class BedrockDimension extends BedrockPlugins {
    #protocol
    #events = new EventEmitter()
    #map

    get #db() { return this.#protocol.parsers }

    get events() { return this.#events }
    get chunks() { return this.#map }
    get length() { return this.chunks.size }

    constructor(plugins = {}) {
        super()

        try {
            this.#initPlugins(plugins)
        } catch (e) {
            console.error(`Unexpected error during engines initialization: ${e.message}, please check your engines correctly!`)
            throw e
        }

        this.#map = new BedrockMap()
    }

    async initProtocol(protocol = undefined, autoInit = true) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else if (autoInit) this.#protocol = await ProtocolLoader.getProtocol(this.version)
        else return
    }

    #initPlugins(plugins) {
        this.loadPlugins(plugins)
    }

    _clear() {
        this.#map.clear()
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
        const Dmap = this.#map

        const BChunk = parser.buildChunk(levelChunkPacket, Dmap, this.plugins?.BlobsManager)
        return BChunk
    }

    /**
     * Adds subchunk packets to the dimension, it will automatically parse them and add to the map, it requires the chunk to be already added to the map.
     * @param {Object} subChunkPacket 
     */
    addSubChunks(subChunkPacket) {
        const parser = this.#db.Subchunk
        const Dmap = this.#map

        parser.buildSubChunks(subChunkPacket, Dmap, this.plugins?.BlobsManager)
    }

    /**
     * Validates and returns the BedrockChunk at the specified coordinates.
     * @param {Number} x Chunk X
     * @param {Number} z Chunk Z
     * @returns {Promise<import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk>}
     */
    async validateChunk(x, z) {
        const Dmap = this.#map
        const adapter = this.plugins.ValidateAdapter
        if (!adapter) throw new TypeError('Cannot validate without adapter')

        const AChunk = adapter.chunk
        const BChunk = Dmap.getChunk(x, z)
        if (!BChunk) return false

        await BChunk.decodeChunkWithAdapter(AChunk)
        return BChunk
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
}