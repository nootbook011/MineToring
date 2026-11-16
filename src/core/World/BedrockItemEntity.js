import { BedrockEntity } from "./BedrockEntity.js";
import { BedrockItemStack } from "./BedrockItemStack.js";

export class BedrockItemEntity extends BedrockEntity {
    /** @type {BedrockItemStack} */
    itemStack

    create(uniqueId, runtimeId, itemStack) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        super.create("item", uniqueId, runtimeId)
        this.itemStack = itemStack
    }
}