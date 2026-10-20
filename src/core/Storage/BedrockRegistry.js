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
    #startGameHandled = false
    /** @type {typeof block.Block} */
    #block
    get block() { return this.#block }

    constructor(bedrockVersion) {
        const staticData = mcData(`bedrock_${bedrockVersion}`)
        if (!staticData) {
            throw new Error('Do not have data for ' + bedrockVersion)
        }
        const data = Object.assign({}, staticData)
        Object.assign(this, data)
    }

    initBlock() {
        this.#block = block(this)
    }

    loadItemStates(itemStates) {
        const items = []
        for (const item of itemStates ?? []) {
            const name = item.name.slice(10)
            items.push({ ...this.itemsByName[name], name, runtimeId: item.runtime_id })
        }
        this.itemsArray = items
        this.items = buildIndexFromArray(this.itemsArray, 'id')
        this.itemsByName = buildIndexFromArray(this.itemsArray, 'name')
        this.itemsByRuntimeId = buildIndexFromArray(this.itemsArray, 'runtimeId')
    }

    loadHashedRuntimeIds() {
        this.blocksByRuntimeId = {}
        const Block = this.#block

        for (let i = 0; i < this.blockStates.length; i++) {
            const { name, states } = this.blockStates[i]
            const hash = Block.getHash(name, states)

            this.blocksByRuntimeId[hash] = { stateId: i, ...this.blocksByStateId[i] }
        }
    }

    loadRuntimeIds() {
        this.blocksByRuntimeId = {}

        for (let i = 0; i < this.blockStates.length; i++) {
            this.blocksByRuntimeId[i] = { stateId: i, ...this.blocksByStateId[i] }
        }
    }

    handleStartGame(packet) {
        if (this.#startGameHandled) return
        this.initBlock()
        this.loadItemStates(packet.itemstates)

        if (packet.block_network_ids_are_hashes) this.loadHashedRuntimeIds()
        else this.loadRuntimeIds()

        this.#startGameHandled = true
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