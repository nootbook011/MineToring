import { EventEmitter } from 'node:events'
import { toBigInt } from "#extra/extraFunctions"

export class BlobsManager {
    /** @type {Map<BigInt, Buffer>} */
    hashMap = new Map()
    events = new EventEmitter().setMaxListeners(500)

    delete(hash) { return this.hashMap.delete(toBigInt(hash)) }
    get(hash) { return this.hashMap.get(toBigInt(hash)) }
    has(hash) { return this.hashMap.has(toBigInt(hash)) }
    set(hash, data) {
        this.hashMap.set(toBigInt(hash), data)
        this.events.emit(toBigInt(hash).toString(), data)
    }
    query(hash, callback) {
        if (this.has(hash)) callback(this.get(hash))
        else this.events.once(toBigInt(hash).toString(), callback)
    }
}