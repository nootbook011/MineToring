export class BedrockMap {
    #storage
    
    constructor(BlobsManager = undefined) {
        const storageMap = new Map()
        this.#storage = storageMap
    }
    
    #getKey(x, z) {
        return `${x},${z}`
    }

    get size() { return this.#storage.size }
    get chunks() { return this.#storage.values() }
    
    setChunk(bChunk, x, z) {
        this.#storage.set(this.#getKey(x, z), bChunk)
    }
    
    delChunk(x, z) {
        this.#storage.delete(this.#getKey(x, z))
    }
    
    getChunk(x, z) {
        return this.#storage.get(this.#getKey(x, z))
    }
    
    hasChunk(x, z) {
        return this.#storage.has(this.#getKey(x, z))
    }
}