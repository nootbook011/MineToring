import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage"

export class BedrockBlobsManager {
    #hashes

    constructor() {
        const hashesMap = new Map()
        this.#hashes = hashesMap
    }

    #getKey(hash) {
        return hash.toString()
    }

    get hashes() { return this.#hashes }

    delHash(hash) {
        this.#hashes.delete(this.#getKey(hash))
    }

    setHash(hash, value) {
        if (!(value instanceof BedrockObjectStorage)) throw new TypeError('BlobsManager supports only bedrock objects')
        this.#hashes.set(this.#getKey(hash), [undefined, value])
    }

    addHash(hash, value) {
        if (!(value instanceof BedrockObjectStorage)) throw new TypeError('BlobsManager supports only bedrock objects')
        const values = this.getHash(hash)
        if (!values) this.setHash(hash, value)
        else {
            if (values[0]) value?.setPayload(values[0])
            values.push(value)
        }
    }

    addPayload(hash, payload) {
        const values = this.getHash(hash)
        if (!values) return
        values[0] = payload

        for (let i = 1; i < values.length; i++) {
            const value = values[i]
            value?.setPayload(payload)
        }
    }
    
    getHash(hash) {
        return this.#hashes.get(this.#getKey(hash))
    }

    hasHash(hash) {
        return this.#hashes.has(this.#getKey(hash))
    }

    hasPayload(hash) {
        return !!this.getHash(hash)?.[0]
    }
}