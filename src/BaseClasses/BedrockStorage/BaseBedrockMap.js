import { V2 } from "#extra/extraWorldFunctions";

export class BedrockMap {
    _storage
    _hashes
    
    constructor() {
        const storageMap = new Map()
        const hashesMap = new Map()
        
        this._storage = storageMap
        this._hashes = hashesMap
    }
    
    #getKey(x, z) {
        return `${x},${z}`
    }
    
    getV2FromKey(key) {
        const arr = key.split(',')
        return V2(arr[0], arr[1])
    }
    
    setChunk(bChunk, x, z) {
        this._storage.set(this.#getKey(x, z), bChunk)
        
        if (bChunk?.cache) {
            for (const h of bChunk.hashes) {
                this._hashes.set(h, bChunk)
            }
        }
    }
    
    delChunk(x, z) {
        this._storage.delete(this.#getKey(x, z))
    }
    
    getChunk(x, z) {
        return this._storage.get(this.#getKey(x, z))
    }
    
    getChunkFromHash(hash) {
        return this._hashes.get(hash)
    }
}