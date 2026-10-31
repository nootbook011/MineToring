import { BedrockEntity } from "./BedrockEntity.js";
import { BedrockItemStack } from "./BedrockItemStack.js";

export class BedrockItemEntity extends BedrockEntity {
    /** @type {BedrockItemStack} */
    itemStack

    create(uniqueId, runtimeId = undefined, itemRuntimeId = undefined, itemId = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)

        this.type = 'item'
        this.uniqueId = uniqueId
        if (runtimeId) this.runtimeId = runtimeId
        
        this.itemStack = new BedrockItemStack(this.registry)
        this.itemStack.create(itemRuntimeId, itemId)
    }
}