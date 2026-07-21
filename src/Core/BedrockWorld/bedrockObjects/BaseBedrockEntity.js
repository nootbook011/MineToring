import { recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from 'node:events'
import { BedrockPlugins } from "#Storage/BedrockPlugins"
import { isV3, V3 } from "#extra/extraWorldFunctions"
import { BedrockAttributes } from "#World/Modules/Attributes"

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

    #created = false
    get isCreated() { return this.#created }

    get pitch() { return this.rotation.x }
    set pitch(val) { this.rotation.x = val }

    get yaw() { return this.rotation.y }
    set yaw(val) { this.rotation.y = val }

    get roll() { return this.rotation.z }
    set roll(val) { this.rotation.z = val }

    create(type, uniqueId, runtimeId = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        
        this.#type = type.startsWith('minecraft:') ? type.slice(10) : type
        this.#metadata = this.registry.entitiesByName[this.#type]
        this.#uniqueId = uniqueId
        if (runtimeId) this.runtimeId = runtimeId

        if (!this.isCreated) this.loadPlugin(new BedrockAttributes(this))
        this.#created = true
    }

    buildFromPacket(entityPacket) {
        const { entity_type: type, unique_id, runtime_id, attributes, position, yaw, head_yaw, pitch } = entityPacket

        this.create(type, unique_id, runtime_id)
        this.updateStatesFromPacket(entityPacket)
        this.attributes.update(attributes, false)
        this.updatePhysics(position, yaw, head_yaw, pitch)

        return this
    }

    updatePhysics(position = undefined, yaw = undefined, head_yaw = undefined, pitch = undefined) {
        if (position) this.position = position
        if (yaw) this.yaw = yaw
        if (head_yaw) this.headYaw = head_yaw
        if (pitch) this.pitch = pitch
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
    updateStatesFromPacket(packet) {
        const { metadata } = packet
        if (!metadata) return

        this.setStates(Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        })))
    }
}