import { parseLu64 } from "#extra/extraFunctions"
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage"

function getKey(hash) {
    if (typeof id === 'bigint' || typeof id === 'number') return id.toString()
    if (Array.isArray(hash)) return parseLu64(hash).toString()
    return hash
}

export class BedrockBlobsManager {
    #hashes = new Map()

    get hashes() { return this.#hashes }

    delHash(hash) {
        this.#hashes.delete(getKey(hash))
    }

    setHash(hash, value) {
        this.#hashes.set(getKey(hash), [undefined, value])
    }

    addHash(hash, value) {
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
    
    getHash(hash) { return this.#hashes.get(getKey(hash)) }
    hasHash(hash) { return this.#hashes.has(getKey(hash)) }
    hasPayload(hash) { return !!this.getHash(hash)?.[0] }
}