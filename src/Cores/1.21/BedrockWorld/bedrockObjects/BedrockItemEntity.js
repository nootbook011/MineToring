import { BedrockEntity } from "./BedrockEntity.js";
import { BedrockItemStack } from "./BedrockItemStack.js";

export class BedrockItemEntity extends BedrockEntity {
    /** @type {BedrockItemStack} */
    #itemStack

    get itemStack() { return this.#itemStack }

    create(uniqueId, runtimeId = undefined, itemRuntimeId = undefined, itemId = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)

        this.type = 'item'
        this.uniqueId = uniqueId
        if (runtimeId) this.runtimeId = runtimeId
        
        this.#itemStack = new BedrockItemStack(this.registry)
        this.#itemStack.create(itemRuntimeId, itemId)
    }

    buildFromPacket(itemEntityPacket) {
        const { entity_id_self, runtime_entity_id, item, position } = itemEntityPacket
        const { network_id, count, extra } = item

        this.create(entity_id_self, runtime_entity_id, network_id)
        this.#itemStack.count = count
        if (extra.has_nbt) this.#itemStack.nbt = extra.nbt
        this.updateStatesFromPacket(itemEntityPacket)
        this.position = position

        return this
    }
}