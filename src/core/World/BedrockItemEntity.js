import { BedrockEntity } from "./BedrockEntity.js";
import { BedrockItemStack } from "./BedrockItemStack.js";

export class BedrockItemEntity extends BedrockEntity {
    /** @type {BedrockItemStack} */
    itemStack

    create(uniqueId, runtimeId, itemRuntimeId) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        super.create("item", uniqueId, runtimeId, false)
        this.itemStack = new BedrockItemStack(this.registry)
        this.itemStack.create(itemRuntimeId)
    }
}