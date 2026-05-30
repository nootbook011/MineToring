import { BedrockPlugins } from '#Storage/BedrockPlugins';
import { recurseUpdate } from '#extra/extraFunctions'
import { isV3, V3 } from '#extra/extraWorldFunctions';
import { simplify } from "prismarine-nbt";

export class BedrockBlock extends BedrockPlugins {
    #position = V3(0, 0, 0)
    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }

    /** @type {import('minecraft-data').Block} */
    #metadata
    
    #states
    #fillBlock = 0
    #entityNBT

    get metadata() { return this.#metadata }
    /** @type {import('minecraft-data').Block} */
    get fillBlock() { return this.registry.blocks[this.#fillBlock] }

    get states() { return simplify({ type: 'compound', value: { ...this.#states } }) }
    get rawStates() { return this.#states }

    get entityNBT() { return simplify({ ...this.#entityNBT }) }
    get rawEntityNBT() { return this.#entityNBT }

    create(id = undefined, runtimeId = undefined) {
        if (!this.protocol || !this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        if (id) this.#metadata = this.registry.blocks[id]
        else if (runtimeId) {
            this.#metadata = this.registry.blocksByRuntimeId[runtimeId]
            this.#states = this.registry.blockStates[this.#metadata.stateId].states
        }
        else this.#metadata = this.registry.blocksByName.air
    }

    setStates(stateId) {
        this.#states = this.registry?.blockStates[stateId].states
    }
    setFillBlock(blockId) {
        this.#fillBlock = blockId
    }
    setEntityData(entityNBT) {
        this.#entityNBT = entityNBT
    }
}