export class BedrockMap {
    #chunks
    #entities
    #cache
    
    constructor() {
        this.#chunks = new Map()
        this.#entities = new Map()
    }

    get entities() {
        return this.#entities.values()
    }

    get entitiesSize() {
        return this.#entities.size
    }

    #getKeyEntities(runtimeId) {
        if (typeof runtimeId === 'bigint') return runtimeId.toString()
    }

    setEntity(entity, runtimeId) {
        this.#entities.set(this.#getKeyEntities(runtimeId), entity)
    }

    delEntity(runtimeId) {
        return this.#entities.delete(this.#getKeyEntities(runtimeId))
    }

    getEntity(runtimeId) {
        return this.#entities.get(this.#getKeyEntities(runtimeId))
    }

    hasEntity(runtimeId) {
        return this.#entities.has(this.#getKeyEntities(runtimeId))
    }

    // - Chunks -
    #getKeyChunks(x, z) {
        return `${x},${z}`
    }

    get size() { return this.#chunks.size }
    get chunks() { return this.#chunks.values() }
    
    setChunk(bChunk, x, z) {
        this.#chunks.set(this.#getKeyChunks(x, z), bChunk)
    }
    
    delChunk(x, z) {
        return this.#chunks.delete(this.#getKeyChunks(x, z))
    }
    
    getChunk(x, z) {
        return this.#chunks.get(this.#getKeyChunks(x, z))
    }
    
    hasChunk(x, z) {
        return this.#chunks.has(this.#getKeyChunks(x, z))
    }
}