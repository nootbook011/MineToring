import { BedrockMap } from "#Storage/BaseBedrockMap"
import { BedrockChunk } from "./bedrockObjects/BaseBedrockChunk.js";

import { BedrockEngineStorage } from "#Storage/BedrockEngineStorage";

const engList = {
    ProtocolValidator: 'ProtocolValidator',
    adapter: 'ValidateAdapter',
    blobs: 'BlobsManager'
}

export class BedrockDimension extends BedrockEngineStorage {
    #Map
    
    get #Protocol() { return this.getEngine(engList.ProtocolValidator)?.Protocol }
    get #db() { return this.#Protocol.DataBase }
    
    get length() { return this.#Map.size }
    get chunks() { return this.#Map.chunks }
    
    constructor(engines = {}) {
        super({}, { safeTypes: false })
        
        try {
            this.#initEngines(engines)
        } catch(e) {
            console.error(`Unexpected error during engines initialization: ${e.message}, please check your engines correctly!`)
            throw e
        }

        this._buildNewMap()
    }

    #initEngines(engines) {
        const { ProtocolValidator, ValidateAdapter, BlobsManager } = engines
        if (!ProtocolValidator?.Protocol) throw new TypeError(
            "This class cannot automatically create engine dependencies, please insert valid class dependencies into engines."
            )
        
        this._setDefaultEngines({
            ValidateAdapter,
            ProtocolValidator,
            BlobsManager
        })
    }

    _buildNewMap() {
        const storageMap = new BedrockMap()
        this.#Map = storageMap
    }
    
    /**
     * adds packets to the dimension, it can be WorldPackets like level_chunk and subchunk, it will automatically parse them and add to the map.
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
     * @returns {BedrockChunk} the added chunk
     */
    addChunk(levelChunkPacket) {
        const parser = this.#db.getParser(this.#db.keys.chunk)
        const Dmap = this.#Map
        
        const BChunk = parser.buildChunk(levelChunkPacket, Dmap, this.getEngine(engList.blobs))
        return BChunk
    }
    
    /**
     * Adds subchunk packets to the dimension, it will automatically parse them and add to the map, it requires the chunk to be already added to the map.
     * @param {Object} subChunkPacket 
     */
    addSubChunks(subChunkPacket) {
        const parser = this.#db.getParser(this.#db.keys.subchunk)
        const Dmap = this.#Map
        
        parser.buildSubChunks(subChunkPacket, Dmap, this.getEngine(engList.blobs))
    }
    
    /**
     * Validates and returns the BedrockChunk at the specified coordinates.
     * @param {Number} x Chunk X
     * @param {Number} z Chunk Z
     * @returns {Promise<BedrockChunk>}
     */
    async validateChunk(x, z) {
        const Dmap = this.#Map
        const adapter = this.getEngine(engList.adapter)
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
     * @returns {BedrockChunk}
     */
    getChunk(x, z) {
        const Dmap = this.#Map

        const BChunk = Dmap.getChunk(x, z)
        return BChunk
    }
}