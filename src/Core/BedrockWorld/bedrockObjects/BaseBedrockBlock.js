import { BedrockPlugins } from '#Storage/BedrockPlugins';
import { isV3, V3 } from '#extra/extraWorldFunctions';
import { EventEmitter } from 'node:events';

export class BedrockBlock extends BedrockPlugins {
    #id = 0
    #runtimeId = undefined
    #stateId = undefined
    #position = V3(0, 0, 0)

    #secondLayerId = 0
    #entityNBT = {}

    get metadata() { return this.registry.blocks[this.#id] }
    get states() { return this.registry.blockStates[this.#stateId].states }

    create(runtimeId = undefined, id = undefined, secondLayerBlockId = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        
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