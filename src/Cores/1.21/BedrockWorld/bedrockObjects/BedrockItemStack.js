import { BedrockRegistry } from "#Cores/1.21/BedrockStorage/BedrockRegistry"

export class BedrockItemStack {
    /** @type {import("minecraft-data").IndexedData} */
    #registry

    #id = 0
    #runtimeId = undefined
    count = 0

    #nbt = {}

    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }

    get metadata() {
        if (this.#id) return this.registry.items[this.#id]
        if (this.#runtimeId) return this.registry.itemsByRuntimeId[this.#runtimeId]
        return {}
    }

    constructor(registry = undefined) {
        if (registry) this.registry = registry
    }

    init(version) {
        this.#registry = new BedrockRegistry(version)
    }

    create(runtimeId = undefined, id = undefined, count = undefined) {
        if (runtimeId) {
            this.#runtimeId = runtimeId
            this.#id = this.registry.itemsByRuntimeId[runtimeId]?.id
        }
        if (id) this.#id = id
        if (count) this.count = count
    }

    get nbt() { return this.#nbt }
    set nbt(newNBT) { if (newNBT) this.#nbt = newNBT }
}