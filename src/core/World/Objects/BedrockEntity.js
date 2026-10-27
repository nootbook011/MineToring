import { nullEmitter, recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from 'node:events'
import { BedrockPlugins } from "#Core/Storage/BedrockPlugins"
import { isV3, V3 } from "#extra/extraWorldFunctions"
import { BedrockAttributes } from "../Modules/BedrockAttributes.js"
import { BedrockRegistry } from "#Storage/BedrockRegistry"

export class BedrockEntity extends BedrockPlugins {
    events = new EventEmitter()
    /** @type {import("minecraft-data").IndexedData} */
    registry

    states = {}

    type = "skeleton"
    uniqueId = 0n
    runtimeId = 0n
    #position = V3(0, 0, 0)
    #rotation = V3(0, 0, 0)
    #velocity = V3(0, 0, 0)
    headYaw = 0

    get metadata() { return this.registry.entitiesByName[this.type] }

    #valid = false
    get isValid() { return this.#valid }

    get pitch() { return this.rotation.x }
    set pitch(val) { this.rotation.x = val }

    get yaw() { return this.rotation.y }
    set yaw(val) { this.rotation.y = val }

    get roll() { return this.rotation.z }
    set roll(val) { this.rotation.z = val }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
    }

    entityEmitter() {
        this.events.on('updateAttributes', (newAttr, oldAttr) => {
            if (this.health <= 0) this.events.emit('death')
        })
    }

    create(type, uniqueId, runtimeId = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)

        this.type = type.startsWith('minecraft:') ? type.slice(10) : type
        this.uniqueId = uniqueId
        if (runtimeId) this.runtimeId = runtimeId

        if (!this.isValid) {
            this.loadPlugin(BedrockAttributes)
            this.entityEmitter()
            this.#valid = true
        }

        return this
    }

    despawn() {
        this.#valid = false

        this.events.emit('despawn')
        this.events.removeAllListeners()
        this.events = nullEmitter
    }

    buildFromPacket(entityPacket) {
        const { entity_type: type, unique_id, runtime_id, attributes, position, yaw, head_yaw, pitch } = entityPacket

        this.create(type, unique_id, runtime_id)
        this.updateStatesFromPacket(entityPacket)
        this.attributes.update(attributes, false)
        this.update(position, yaw, head_yaw, pitch)

        return this
    }

    update(position = undefined, yaw = undefined, head_yaw = undefined, pitch = undefined) {
        if (position) this.position = position
        if (yaw) this.yaw = yaw
        if (head_yaw) this.headYaw = head_yaw
        if (pitch) this.pitch = pitch
    }

    get position() { return this.#position }
    set position(v3) { if (isV3(v3)) Object.assign(this.#position, v3); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }
    
    get rotation() { return this.#rotation }
    set rotation(v3) { if (isV3(v3)) Object.assign(this.#rotation, v3); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }
    
    get velocity() { return this.#velocity }
    set velocity(v3) { if (isV3(v3)) Object.assign(this.#velocity, v3); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }

    setStates(statesInput) { recurseUpdate(this.states, statesInput) }
    updateStatesFromPacket(packet) {
        const { metadata } = packet
        if (!metadata) return

        this.setStates(Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        })))
    }
}