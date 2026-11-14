import { nullEmitter, recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from 'node:events'
import { BedrockPlugins } from "#Core/Storage/BedrockPlugins"
import { isV3, updateV3, V3 } from "#extra/extraWorldFunctions"
import { BedrockRegistry } from "#Storage/BedrockRegistry"
import { DIMENSIONS } from "#Storage/constants"

export class BedrockEntity extends BedrockPlugins {
    events = new EventEmitter()
    /** @type {import("minecraft-data").IndexedData} */
    registry

    states = {}

    type = "skeleton"
    uniqueId = 0n
    runtimeId = 0n
    #dimension = 0
    #position = V3(0, 0, 0)
    #rotation = V3(0, 0, 0)
    #velocity = V3(0, 0, 0)
    headYaw = 0

    get metadata() { return this.registry.entitiesByName[this.type] }

    #terminate = false
    #valid = false
    get isValid() { return this.#valid }

    get pitch() { return this.#rotation.x }
    set pitch(val) { this.#rotation.x = val }

    get yaw() { return this.rotation.y }
    set yaw(val) { this.#rotation.y = val }

    get roll() { return this.rotation.z }
    set roll(val) { this.#rotation.z = val }

    get dimension() { return this.#dimension }
    set dimension(dimension) {
        if (typeof dimension === 'string') dimension = DIMENSIONS[dimension]
        if (typeof dimension !== 'number') throw new TypeError(`Expected number, received ${typeof dimension}`)

        this.#dimension = dimension
        this.events.emit("changeDimension", dimension, this.#dimension)
    }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
        return this
    }

    create(type, uniqueId, runtimeId) {
        if (this.#terminate) throw new Error(`Entity ${this.runtimeId}|${this.uniqueId}|${this.type} tried to create after despawn.`)
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)

        if (type) this.type = type.startsWith('minecraft:') ? type.slice(10) : type
        if (uniqueId) this.uniqueId = BigInt(uniqueId)
        if (runtimeId) this.runtimeId = BigInt(runtimeId)
        if (!this.isValid) this.#valid = true

        return this
    }

    despawn() {
        this.#valid = false
        this.#terminate = true
        this.events.emit('despawn')
        this.events.removeAllListeners()
        this.events = nullEmitter
    }

    updatePosition(x, y, z) {
        if (updateV3(this.#position, x, y, z)) this.events.emit('move', this.#position)
    }
    updateRotation(x, y, z) {
        if (updateV3(this.#rotation, x, y, z)) this.events.emit('rotate', this.#rotation)
    }

    get position() { return this.#position }
    set position(v3) { if (isV3(v3)) this.updatePosition(v3.x, v3.y, v3.z); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }

    get rotation() { return this.#rotation }
    set rotation(v3) { if (isV3(v3)) this.updateRotation(v3.x, v3.y, v3.z); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }

    get velocity() { return this.#velocity }
    set velocity(v3) {
        if (isV3(v3)) {
            this.#velocity.x = v3.x
            this.#velocity.y = v3.y
            this.#velocity.z = v3.z
        }
        else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`)
    }

    setStates(statesInput) {
        const old = { ...this.states }
        const changed = recurseUpdate(this.states, statesInput)
        if (changed) this.events.emit('updateStates', this.states, old)
        return changed
    }
}