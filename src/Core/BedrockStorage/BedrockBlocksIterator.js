import { BedrockBlock } from "#Base/BedrockWorld/bedrockObjects/BaseBedrockBlock"
import { DimensionAccessError } from "#extra/errors"
import { V3 } from "#extra/extraWorldFunctions"

export class BlocksAreaIterator {
    #curr
    #done = false

    /**
     * 
     * @param {(worldV3: {x, y, z}) => any} callBack 
     * @param {*} p1 
     * @param {*} p2 
     */
    constructor(callBack, p1, p2) {
        this.callBack = callBack
        this.from = {
            x: Math.min(p1.x, p2.x),
            y: Math.min(p1.y, p2.y),
            z: Math.min(p1.z, p2.z)
        }

        this.to = {
            x: Math.max(p1.x, p2.x),
            y: Math.max(p1.y, p2.y),
            z: Math.max(p1.z, p2.z)
        }

        this.#curr = { ...this.from }
    }

    get length() {
        return (this.to.x - this.from.x + 1) *
            (this.to.y - this.from.y + 1) *
            (this.to.z - this.from.z + 1)
    }

    /**
     * 
     * @returns { { done: Boolean, value: false | BedrockBlock }
     */
    next() {
        if (this.#done) return { value: undefined, done: true }

        let block
        try {
            block = this.callBack(this.#curr)
        } catch (e) {
            if (e instanceof DimensionAccessError) {
                block = false
            } else {
                throw e
            }
        }

        const result = { value: block, done: false }

        this.#curr.z++
        if (this.#curr.z > this.to.z) {
            this.#curr.z = this.from.z
            this.#curr.x++
            if (this.#curr.x > this.to.x) {
                this.#curr.x = this.from.x
                this.#curr.y++
                if (this.#curr.y > this.to.y) {
                    this.#done = true
                }
            }
        }

        return result
    }

    [Symbol.iterator]() {
        return this
    }
}