import { BedrockMap } from "#Storage/BaseBedrockMap"
import { BedrockEntities } from "#Storage/BaseBedrockEntities"
import { EventEmitter } from 'node:events'

import { BedrockPlugins } from "#Storage/BedrockPlugins";

export class BedrockDimension extends BedrockPlugins {
    #events = new EventEmitter()
    #Map
    #Entities
    
    get #Protocol() { return this.plugins.ProtocolValidator.Protocol }
    get #db() { return this.#Protocol.DataBase }
    
    get events() { return this.#events }
    get chunks() { return this.#Map }
    get length() { return this.chunks.size }
    get entities() { return this.#Entities }
    
    constructor(plugins = {}) {
        super()
        
        try {
            this.#initPlugins(plugins)
        } catch(e) {
            console.error(`Unexpected error during engines initialization: ${e.message}, please check your engines correctly!`)
            throw e
        }

        this.#Map = new BedrockMap()
        this.#Entities = new BedrockEntities()
    }

    #initPlugins(plugins) {
        const { ProtocolValidator } = plugins
        if (!ProtocolValidator?.Protocol) throw new TypeError(
            "This class cannot automatically create engine dependencies, please insert valid class dependencies into engines."
            )
        
        this.loadPlugins(plugins)
    }

    _clear() {
        this.#Map.clear()
        this.#Entities.clear()
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
     * Adds an entity packet to the dimension, it will automatically parse it and add to the map.
     * @param {object} entityPacket 
     * @returns {import('#World/bedrockObjects/BaseBedrockEntity').BedrockEntity}
     */
    addEntity(entityPacket) {
        const parser = this.#db.getParser(this.#db.keys.entity)
        const entities = this.#Entities
        
        const BEntity = parser.buildEntity(entityPacket, entities, this.events)
        return BEntity
    }
    
    /**
     * Adds a level chunk packet to the dimension, it will automatically parse it and add to the map.
     * @param {Object} levelChunkPacket 
     * @returns {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk} the added chunk
     */
    addChunk(levelChunkPacket) {
        const parser = this.#db.getParser(this.#db.keys.chunk)
        const Dmap = this.#Map
        
        const BChunk = parser.buildChunk(levelChunkPacket, Dmap, this.plugins.BlobsManager)
        return BChunk
    }
    
    /**
     * Adds subchunk packets to the dimension, it will automatically parse them and add to the map, it requires the chunk to be already added to the map.
     * @param {Object} subChunkPacket 
     */
    addSubChunks(subChunkPacket) {
        const parser = this.#db.getParser(this.#db.keys.subchunk)
        const Dmap = this.#Map
        
        parser.buildSubChunks(subChunkPacket, Dmap, this.plugins.BlobsManager)
    }
    
    /**
     * Validates and returns the BedrockChunk at the specified coordinates.
     * @param {Number} x Chunk X
     * @param {Number} z Chunk Z
     * @returns {Promise<import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk>}
     */
    async validateChunk(x, z) {
        const Dmap = this.#Map
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
        const Dmap = this.#Map

        const BChunk = Dmap.getChunk(x, z)
        return BChunk
    }

    /**
     * 
     * @param {*} runtimeId 
     * @returns {import('#World/bedrockObjects/BaseBedrockEntity').BedrockEntity}
     */
    getEntity(runtimeId) {
        return this.#Map.getEntity(runtimeId)
    }
}