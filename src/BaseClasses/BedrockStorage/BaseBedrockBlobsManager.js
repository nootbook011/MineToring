import { parseLu64 } from "#extra/extraFunctions"

export class BedrockBlobsManager {
    #hashes

    constructor() {
        const hashesMap = new Map()
        this.#hashes = hashesMap
    }

    #getKey(hash) {
        return parseLu64(hash)
    }

    delHash(hash) {
        this.#hashes.delete(this.#getKey(hash))
    }

    setHash(hash, value) {
        this.#hashes.set(this.#getKey(hash), value)
    }
    
    getHash(hash) {
        return this.#hashes.get(this.#getKey(hash))
    }

    hasHash(hash) {
        return this.#hashes.has(this.#getKey(hash))
    }

    hasChunkData(hash) {
        return this.getHash(hash)?.hasChunk ?? false
    }
    
    hasSubChunkData(hash) {
        return this.getHash(hash)?.hasPayload ?? false
    }
}