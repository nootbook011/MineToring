import { BedrockPlugins } from '#Storage/BedrockPlugins';
import { isV3, V3 } from '#extra/extraWorldFunctions';
import { EventEmitter } from 'node:events';
import { BedrockRegistry } from "../../index.js"

export class BedrockBlock extends BedrockPlugins {
    /** @type {import("minecraft-data").IndexedData} */
    #registry
    
    #id = 0
    #runtimeId = undefined
    #stateId = undefined
    #position = V3(0, 0, 0)

    #secondLayerId = 0
    #entityNBT = {}

    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }

    get metadata() {
        if (this.#id) return this.registry.blocks[this.#id]
        if (this.#runtimeId) return this.registry.blocksByRuntimeId[this.#runtimeId]
        return {}
    }
    get states() { return this.registry.blockStates[this.#stateId].states }

    constructor(registry = undefined) {
        super()
        if (registry) this.registry = registry
    }

    init(version) {
        this.#registry = new BedrockRegistry(version)
    }

    create(runtimeId = undefined, id = undefined, secondLayerBlockId = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        if (runtimeId) {
            const metadata = this.registry.blocksByRuntimeId[runtimeId]
            this.#id = metadata.id
            this.#stateId = metadata.stateId
            this.#runtimeId = runtimeId
        }
        if (id) this.#id = id
        if (secondLayerBlockId) this.#secondLayerId = secondLayerBlockId
    }

    get id() { return this.#id }
    get runtimeId() { return this.#runtimeId }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return Object.assign(this.#position, v3)
        else return false
    }

    get secondLayerBlock() { return this.registry.blocks[this.#secondLayerId] }
    set secondLayerBlockId(newId) { this.#secondLayerId = newId }

    get entityNBT() { return this.#entityNBT }
    set entityNBT(newEntityNBT) { if (newEntityNBT) this.#entityNBT = newEntityNBT }
}