import { BedrockPlugins } from '#Storage/BedrockPlugins';
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

    /**
     * @type {Block}
     */
    #metadata = {}
    #states = {}
    #fillBlock = 'air'
    #entityNBT = {}

    get metadata() { return this.#metadata }
    get states() { return simplify({ type: 'compound', value: this.#states }) }
    get rawStates() { return this.#states }
    get fillBlock() { return this.#fillBlock }
    get entityNBT() { return simplify(this.#entityNBT) }
    get rawEntityNBT() { return this.#entityNBT }

    /**
     * 
     * @param {Block} metadata 
     */
    constructor(metadata = undefined, states = undefined) {
        super()
        if (metadata) this.setMetadata(metadata)
        if (states) this.setStates(states)
    }

    setStates(registryStates) {
        this.#states = { ...registryStates }
    }

    setExtraLayer(blockName) {
        if (!blockName || blockName === 'air') return
        this.#fillBlock = blockName
    }

    setEntityData(entityNBT) {
        this.#entityNBT = { ...entityNBT }
    }

    setMetadata(metadataInput) {
        recurseUpdate(this.#metadata, metadataInput)
    }
}