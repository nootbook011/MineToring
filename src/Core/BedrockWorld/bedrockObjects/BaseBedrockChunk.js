import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockChunk extends BedrockObjectStorage {
    #SubChunks = {}
    #isRaw = true
    
    /**
     * decodes the chunk with the provided adapter, it will automatically decode the subchunks as well, it requires the chunk to be in raw state, and it will set the chunk to decoded state after decoding.
     * @param {import('#Main/Packets/Versions/vDefault/Adapters/BaseChunkAdapter').BaseChunkAdapter} adapter 
     */
    async decodeChunkWithAdapter(adapter) {
        const decodedChunk = await adapter.buildFromBedrockChunk(this)
        
        const subchunks = this.subChunks
        const decodedSubChunks = await adapter.buildFromBedrockSubChunks(this, decodedChunk)
        
        for (const [y, subChunkClass] of Object.entries(subchunks)) {
            const decodeSub = decodedSubChunks[y]
            if (decodeSub === undefined) continue
            
            subChunkClass._setDecodeSubChunk(decodeSub)
        }
        
        this._setDataDecoded({ decodeChunk: decodedChunk })
        this.#isRaw = false
    }
    
    toRaw() {
        this.setData({})
        this.#isRaw = true
    }
    
    get cache() {
        return this.metadata?.cache
    }
    
    get subChunks() {
        return this.#SubChunks
    }

    /**
     * 
     * @param {Number} y 
     * @returns {import("./BaseBedrockSubChunk.js").BedrockSubChunk}
     */
    getSubChunk(y) {
        return this.#SubChunks[y]
    }
    
    setSubChunk(y, bedrockSubChunk) {
        this.#SubChunks[y] = bedrockSubChunk
    }

    get hasChunk() {
        return this.data.raw.payload.length > 1
    }

    get hasSubChunks() {
        return Object.keys(this.subChunks).length > 0
    }

    get isRaw() {
        return this.#isRaw
    }
    
    /**
     * @type {import('prismarine-chunk').BedrockChunk}
     */
    get DChunk() {
        return this.data.decoded.decodeChunk
    }
    
    DSubChunk(y) {
        return this.subChunks[y].DSubChunk
    }
}