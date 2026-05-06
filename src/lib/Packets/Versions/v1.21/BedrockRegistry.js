import block from 'prismarine-block'
import buildIndexFromArray from "prismarine-registry/lib/indexer.js"
import BSDefault from '../vDefault/BedrockRegistry.js'
import fs from 'fs/promises'

/*
 I had to rewrite the primarine-registry into a newer class, 
 the only difference from the original is a more accurate definition of blocksByRuntimeId.
*/

export default class BedrockRegistry extends BSDefault {
    #loadItemStates(itemStates) {
        const items = []
        for (const item of itemStates) {
            const name = item.name.replace('minecraft:', '')
            items.push({ ...this.itemsByName[name], name, id: item.runtime_id })
        }
        this.itemsArray = items
        this.items = buildIndexFromArray(this.itemsArray, 'id')
        this.itemsByName = buildIndexFromArray(this.itemsArray, 'name')
    }

    #loadHashedRuntimeIds() {
        this.blocksByRuntimeId = {}
        const Block = block(this)
        for (let i = 0; i < this.blockStates.length; i++) {
            const { name, states } = this.blockStates[i]
            const hash = Block.getHash(name, states)
            this.blocksByRuntimeId[hash] = { stateId: i, ...this.blocksByName[this.blockStates[i].name] }
        }
    }

    #loadRuntimeIds() {
        this.blocksByRuntimeId = {}
        for (let i = 0; i < this.blockStates.length; i++) {
            this.blocksByRuntimeId[i] = { stateId: i, ...this.blocksByName[this.blockStates[i].name] }
        }
    }

    handleStartGame(packet) {
        this.#loadItemStates(packet.itemstates)
        if (packet.block_network_ids_are_hashes) {
            this.#loadHashedRuntimeIds()
        } else {
            this.#loadRuntimeIds()
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