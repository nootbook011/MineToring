import { ChunkAccessError } from "#extra/errors"
import { V3, isV3, packV3, unpackV3 } from "#extra/extraWorldFunctions"
import { BedrockThread } from "./BedrockThread.js"

export class BlocksIterator {
    #thread
    #cb
    #done = false

    /**
     * 
     * @param {Function} cb 
     * @param {BedrockThread} thread 
     */
    constructor(cb, thread) {
        if (!(thread instanceof BedrockThread)) throw new TypeError('BedrockThread only!')
        this.#cb = cb
        this.#thread = thread
    }

    get length() { return this.#thread.length }
    
    /**
     * 
     * @returns {{ value: import("#World/bedrockObjects/BaseBedrockBlock").BedrockBlock | undefined, done: Boolean }}
     */
    next() {
        const packed = this.#thread.next()
        if (!packed) this.#done = true
        if (this.#done) return { value: undefined, done: true }
        
        const v3 = unpackV3(packed)
        return { value: this.#cb(v3), done: false }

    }
    
    [Symbol.iterator]() {
        return this
    }
}