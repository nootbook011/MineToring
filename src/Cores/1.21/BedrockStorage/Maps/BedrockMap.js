import { getIndexV2 } from "#extra/extraWorldFunctions"

export class BedrockMap {
    /** @type {Map<number, import('../../BedrockWorld/bedrockObjects/BedrockChunk').BedrockChunk>} */
    #chunks = new Map()

    get size() { return this.#chunks.size }
    get values() { return this.#chunks.values() }
    
    setChunk(bChunk, x, z) {
        this.#chunks.set(getIndexV2(x, z), bChunk)
    }
    
    delChunk(x, z) {
        return this.#chunks.delete(getIndexV2(x, z))
    }
    
    getChunk(x, z) {
        return this.#chunks.get(getIndexV2(x, z))
    }
    
    hasChunk(x, z) {
        return this.#chunks.has(getIndexV2(x, z))
    }

    clear() { this.#chunks.clear() }
}