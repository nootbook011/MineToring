import { parseBigInt } from "#extra/extraWorldFunctions"

export class BedrockBlobsManager {
    #hashes

    constructor() {
        const hashesMap = new Map()
        this.#hashes = hashesMap
    }

    #getKey(hash) {
        return parseBigInt(hash)
    }

    delChunk(hash) {
        this.#hashes.delete(this.#getKey(hash))
    }

    setChunk(hash, value) {
        this.#hashes.set(this.#getKey(hash), value)
    }

    getChunk(hash) {
        return this.#hashes.get(this.#getKey(hash))
    }

    hasChunk(hash) {
        return this.#hashes.has(this.#getKey(hash))
    }

    hasChunkData(hash) {
        return this.getChunk(hash)?.hasChunk ?? false
    }
}