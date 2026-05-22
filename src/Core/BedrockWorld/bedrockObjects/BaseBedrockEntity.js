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

    /** @type {import('minecraft-data').Entity} */
    metadata

    // rotation in degrees
    pitch = 0
    yaw = 0
    headYaw = 0

    create(type, uniqueId, runtimeId = undefined) {
        this.#type = type.startsWith('minecraft:') ? type.slice(10) : type
        this.#uniqueId = uniqueId
        if (runtimeId) this.runtimeId = runtimeId
    }

    get type() { return this.#type }
    get uniqueId() { return this.#uniqueId }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }

    get events() { return this.#events }

    get states() { return this.#states }
    setStates(statesInput) { recurseUpdate(this.states, statesInput) }
}