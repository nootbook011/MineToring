import block from 'prismarine-block'
import mcData from 'minecraft-data'

/*
 * thanks prismarine-registry library for code reference 
*/

function buildIndexFromArray(array, fieldToIndex) {
    if (array === undefined) { return undefined }
    return array.reduce(function (index, element) {
        index[element[fieldToIndex]] = element
        return index
    }, {})
}

export class BedrockRegistry {
    /** @type {typeof block.Block} */
    block

    constructor(bedrockVersion) {
        const staticData = mcData(`bedrock_${bedrockVersion}`)
        if (!staticData) {
            throw new Error('Do not have data for ' + bedrockVersion)
        }
        Object.assign(this, staticData)
        this.block = block(this)
    }

    loadItemStates(itemStates) {
        const items = []
        for (const item of itemStates ?? []) {
            const name = item.name.slice(10)
            const itemData = this.itemsByName[name]
            const id = itemData?.id ?? item.runtime_id
            items.push({ ...itemData, name, runtimeId: item.runtime_id, id })
        }
        this.itemsArray = items
        this.items = buildIndexFromArray(this.itemsArray, 'id')
        this.itemsByName = buildIndexFromArray(this.itemsArray, 'name')
        this.itemsByRuntimeId = buildIndexFromArray(this.itemsArray, 'runtimeId')
    }

    loadHashedRuntimeIds() {
        this.blocksByRuntimeId = {}
        const Block = this.block

        for (let i = 0; i < this.blockStates.length; i++) {
            const { name, states } = this.blockStates[i]
            const hash = Block.getHash(name, states)

            this.blocksByStateId[i].runtimeId = hash
            this.blocksByRuntimeId[hash] = { stateId: i, ...this.blocksByStateId[i] }
        }
    }

    loadRuntimeIds() {
        this.blocksByRuntimeId = {}

        for (let i = 0; i < this.blockStates.length; i++) {
            this.blocksByStateId[i].runtimeId = i
            this.blocksByRuntimeId[i] = { stateId: i, ...this.blocksByStateId[i] }
        }
    }

    writeItemStates() {
        const itemstates = []
        for (const item of this.itemsArray) {
            // Custom items with different namespaces can also be in the palette
            let [ns, name] = item.name.split(':')
            if (!name) {
                name = ns
                ns = 'minecraft'
            }

            itemstates.push({ name: `${ns}:${name}`, runtime_id: item.id, component_based: ns !== 'minecraft' })
        }

        return itemstates
    }

}