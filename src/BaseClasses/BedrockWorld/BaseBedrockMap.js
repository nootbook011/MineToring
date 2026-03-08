export class BedrockMap {
    _storageMapUnit
    
    constructor() {
        const storageMap = new Map()
        this._storageMapUnit = storageMap
    }
    
    #getKey(x, z) {
        return `${x},${z}`
    }
    
    setChunk(bChunk, x, z) {
        this._storageMapUnit.set(this.#getKey(x, z), bChunk)
    }
    
    delChunk(x, z) {
        this._storageMapUnit.delete(this.#getKey(x, z))
    }
    
    getChunk(x, z) {
        return this._storageMapUnit.get(this.#getKey(x, z))
    }
}