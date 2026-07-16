import { recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from 'node:events'
import { BedrockPlugins } from "#Storage/BedrockPlugins"
import { isV3, V3 } from "#extra/extraWorldFunctions"

export class BedrockEntity extends BedrockPlugins {
    #events = new EventEmitter()
    #states = {}

    #type = "skeleton"
    #uniqueId = 0n
    runtimeId = 0n
    #position = V3(0, 0, 0)
    #rotation = V3(0, 0, 0)
    headYaw = 0

    /** @type {import('minecraft-data').Entity} */
    #metadata

    get pitch() { return this.rotation.x }
    set pitch(val) { this.rotation.x = val }

    get yaw() { return this.rotation.y }
    set yaw(val) { this.rotation.y = val }

    get roll() { return this.rotation.z }
    set roll(val) { this.rotation.z = val }

    create(type, uniqueId, runtimeId = undefined) {
        if (!this.protocol || !this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        this.#type = type.startsWith('minecraft:') ? type.slice(10) : type
        this.#metadata = this.registry.entitiesByName[this.#type]
        this.#uniqueId = uniqueId
        if (runtimeId) this.runtimeId = runtimeId
    }

    buildFromPacket(entityPacket) {
        const parser = this.protocol.parsers.Entity
        if (!parser) throw new Error(`Cannot load Entity parser!`)
        
        parser.buildEntity(entityPacket, this)
    }

    get metadata() { return this.#metadata }

    get type() { return this.#type }
    get uniqueId() { return this.#uniqueId }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }
    get rotation() { return this.#rotation }
    set rotation(v3) {
        if (isV3(v3)) return this.#rotation = v3
        else return false
    }

    get events() { return this.#events }

    get states() { return this.#states }
    setStates(statesInput) { recurseUpdate(this.states, statesInput) }
}