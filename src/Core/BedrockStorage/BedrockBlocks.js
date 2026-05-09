import { isV3, packV3, unpackV3 } from "#extra/extraWorldFunctions"

export class BedrockBlocks {
    #set = new Set()
    #cb

    constructor(cb) {
        this.#cb = cb
    }

    add(v3) {
        if (!isV3(v3)) return false
        this.#set.add(packV3(v3.x, v3.y, v3.z))
        return true
    }

    set(packed) {
        this.#set.add(packed)
    }

    has(v3) {
        if (!isV3(v3)) return false
        return this.#set.has(packV3(v3.x, v3.y, v3.z))
    }

    delete(v3) {
        if (!isV3(v3)) return false
        return this.#set.delete(packV3(v3.x, v3.y, v3.z))
    }

    clear() {
        this.#set.clear()
    }

    get size() {
        return this.#set.size
    }

    get values() {
        return this[Symbol.iterator]()
    }

    *[Symbol.iterator]() {
        for (let packed of this.#set) {
            yield this.#cb(unpackV3(packed))
        }
    }
}