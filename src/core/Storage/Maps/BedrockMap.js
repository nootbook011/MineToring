import { packV2 } from "#extra/extraWorldFunctions"

export class BedrockMap {
    /** @type {Map<number, import('#World/BedrockChunk').BedrockChunk>} */
    #chunks = new Map()

    get size() { return this.#chunks.size }
    values() { return this.#chunks.values() }
    clear() { this.#chunks.clear() }
    
    setChunk(x, z, bChunk) {
        this.#chunks.set(packV2(x, z), bChunk)
    }
    
    delChunk(x, z) {
        return this.#chunks.delete(packV2(x, z))
    }
    
    getChunk(x, z) {
        return this.#chunks.get(packV2(x, z))
    }
    
    hasChunk(x, z) {
        return this.#chunks.has(packV2(x, z))
    }
}