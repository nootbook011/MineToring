export class BedrockMap {
    #chunks
    
    constructor() {
        this.#chunks = new Map()
    }

    #getKey(x, z) {
        return `${x},${z}`
    }

    get size() { return this.#chunks.size }
    get values() { return this.#chunks.values() }
    
    setChunk(bChunk, x, z) {
        this.#chunks.set(this.#getKey(x, z), bChunk)
    }
    
    delChunk(x, z) {
        return this.#chunks.delete(this.#getKey(x, z))
    }
    
    getChunk(x, z) {
        return this.#chunks.get(this.#getKey(x, z))
    }
    
    hasChunk(x, z) {
        return this.#chunks.has(this.#getKey(x, z))
    }

    clear() { this.#chunks.clear() }
}