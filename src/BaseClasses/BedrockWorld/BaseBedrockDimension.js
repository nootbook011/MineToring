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

    #processChunkUpdate(BChunk, { chunk, subchunks }) {
        if (chunk) {
            BChunk.buildFromChunkPacket(chunk)
        }

        if (subchunks) {
            BChunk.buildFromSubChunkPacket(subchunks, this.getEngine(engList.blobs))
        }
    }

    _buildNewMap() {
        const storageMap = new BedrockMap()
        this.#Map = storageMap
    }
    
    // TODO: update jsdoc
    /**
     * Adds or updates chunk data in the dimension.
     * * @param {Object} packetsObj - The object containing protocol packets.
     * @param {Object} [packetsObj.chunk] - The main level chunk packet (LevelChunk).
     * @param {number} packetsObj.chunk.x - Chunk X coordinate (V2).
     * @param {number} packetsObj.chunk.z - Chunk Z coordinate (V2).
     * @param {Object} [packetsObj.subchunks] - The sub-chunk data packet (SubChunk).
     * @param {Object} packetsObj.subchunks.origin - The absolute world position of the sub-chunk set.
     * @param {Array} packetsObj.subchunks.entries - The list of sub-chunk entries.
     * * @description
     * This method serves as the main entry point for world updates. 
     * It automatically creates a new BedrockChunk if it doesn't exist 
     * or updates the existing one with fresh data.
     */
    addChunk(packets = {}, x = 0, z = 0) {
        if (x == null || z == null) return
        const Dmap = this.#Map
        
        let BChunk = Dmap.getChunk(x, z)
        if (!BChunk) BChunk = new BedrockChunk(this.#db)

        this.#processChunkUpdate(BChunk, packets)

        if (!Dmap.hasChunk(x, z)) Dmap.setChunk(BChunk, x, z)
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