export class BedrockMap {
    #blobs
    #storage
    
    constructor(BlobsManager = undefined) {
        const storageMap = new Map()
        
        this.#blobs = BlobsManager
        this.#storage = storageMap
    }
    
    #getKey(x, z) {
        return `${x},${z}`
    }

    get size() { return this.#storage.size }
    get chunks() { return this.#storage.values() }
    
    setChunk(bChunk, x, z) {
        this.#storage.set(this.#getKey(x, z), bChunk)
        
        if (bChunk?.cache) {
            if (!this.#blobs) throw new TypeError('Cannot set hashes without worlds blobs map')
            const blobsMap = this.#blobs
            
            for (const h of bChunk.hashes) {
                blobsMap.setChunk(h, bChunk)
            }
        }
    }
    
    delChunk(x, z) {
        this.#storage.delete(this.#getKey(x, z))
    }
    
    getChunk(x, z) {
        return this.#storage.get(this.#getKey(x, z))
    }
}