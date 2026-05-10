import { BedrockPlugins } from '#Base/BedrockStorage/BedrockPlugins';
import { recurseUpdate } from '#extra/extraFunctions'
import { isV3, V3 } from '#extra/extraWorldFunctions';
import { simplify } from "prismarine-nbt";

/**
 * @typedef {import('minecraft-data').Block} Block
 */

export class BedrockBlock extends BedrockPlugins {
    #position = V3(0, 0, 0)
    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }

    #metadata = {}
    #states
    #fillBlock = 'air'
    #entityNBT = {}

    /**
     * @type {Block}
     */
    get metadata() { return this.#metadata }
    get states() { return this.#states }
    get fillBlock() { return this.#fillBlock }
    get entityNBT() { return this.#entityNBT }

    /**
     * 
     * @param {Block} staticObject 
     */
    constructor(metadata, states = undefined) {
        super()
        this.setMetadata(metadata)
        if (states) this.addStates(states)
    }

    addStates(registryStates) {
        this.#states = simplify({ type: 'compound', value: { ...registryStates } })
    }

    addExtraLayer(blockName) {
        if (!blockName || blockName === 'air') return
        this.#fillBlock = blockName
    }

    addEntityData(entityNBT) {
        this.#entityNBT = { ...entityNBT }
    }

    setMetadata(metadataInput) {
        recurseUpdate(this.#metadata, metadataInput)
    }

}