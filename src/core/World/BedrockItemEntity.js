import { BedrockEntity } from "./BedrockEntity.js";
import { BedrockItemStack } from "./BedrockItemStack.js";

export class BedrockItemEntity extends BedrockEntity {
    /** @type {BedrockItemStack} */
    itemStack

    create(uniqueId, runtimeId, itemRuntimeId, count) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        super.create("item", uniqueId, runtimeId)
        this.itemStack = new BedrockItemStack(this.registry)
        this.itemStack.create(itemRuntimeId, count)
    }
}