import { isV2, V2 } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockChunk extends BedrockObjectStorage {
    #position = V2(0, 0)
    get position() { return this.#position }
    set position(v2) {
        if (isV2(v2)) return this.#position = v2
        else return false
    }

    #SubChunks = {}
        
    get cache() {
        return this.metadata?.cache
    }
    
    get subChunks() {
        return this.#SubChunks
    }

    /**
     * It does nothing if chunk has not been initialized inside the dimension class.
     * If it does, it decodes new payload of data using a special function that is automatically adjusted to a specific version.
     */
    setPayload(payload) {
        this.setData({ payload })
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

    getBlockId(x, y, z, l) {
        const subChunkY = y >> 4
        return this.getSubChunk(subChunkY)?.getBlockId(x, y & 0xF, z, l)
    }
    setBlockId(x, y, z, l, id) {
        const subChunkY = y >> 4
        this.getSubChunk(subChunkY)?.setBlockId(x, y & 0xF, z, l, id)
    }

    get hasPayload() {
        return this.data.payload?.length > 1
    }

    get hasSubChunks() {
        return Object.keys(this.subChunks).length > 0
    }
}