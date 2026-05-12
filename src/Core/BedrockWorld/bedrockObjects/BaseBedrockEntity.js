import { recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from 'node:events'
import { BedrockPlugins } from "#Storage/BedrockPlugins"
import { isV3, V3 } from "#extra/extraWorldFunctions"

/**
 * @template {{type: string, id: { unique: bigint, runtime: bigint }}} T
 */
export class BedrockEntity extends BedrockPlugins {
    #events = new EventEmitter()
    /**
     * @type {T}
     * @private
     */
    #metadata = {
        type: "",
        id: {
            unique: 0n,
            runtime: 0n
        }
    }
    #states = {}
    #position = V3(0, 0, 0)
    #velocity = V3(0, 0, 0)
    #rotation = {
        pitch: 0,
        yaw: {
            all: 0,
            body: 0,
            head: 0
        }
    }
    #collision = {
        scale: 0,
        hitbox: {},
        boundingbox: {
            width: 0,
            height: 0,
        },
    }

    /**
     * 
     * @param {T} metadata 
     * @param {object} states 
     */
    constructor(metadata = undefined, states = undefined) {
        super()
        if (metadata) this.#metadata = metadata
        this.#states = states
    }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }
    get rotation() { return this.#rotation }
    /**
     * @param {number} pitch 
     * @param {{all: number, body: number, head: number}} yaw 
     */
    setRotation(pitch = undefined, yaw = {}) {
        const rotation = this.#rotation
        if (pitch) rotation.pitch = pitch
        if (yaw) {
            const { all, head, body } = yaw
            if (all) rotation.yaw.all = all
            if (head) rotation.yaw.head = head
            if (body) rotation.yaw.body = body
        }
    }
    get collision() { return this.#collision }
    get velocity() { return this.#velocity }
    set velocity(v3) {
        if (isV3(v3)) return this.#velocity = v3
        else return false
    }

    get events() { return this.#events }

    /** @returns {T} */
    get metadata() { return this.#metadata }
    /** @param {Partial<T>} metadataInput */
    setMetadata(metadataInput) {
        recurseUpdate(this.#metadata, metadataInput)
    }

    get states() { return this.#states }
    setStates(statesInput) {
        recurseUpdate(this.#states, statesInput)
    }
}