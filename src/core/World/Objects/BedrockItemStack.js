import { BedrockRegistry } from "#Storage/BedrockRegistry"

export class BedrockItemStack {
    /** @type {import("minecraft-data").IndexedData} */
    registry

    id = 0
    runtimeId = undefined
    count = 0

    nbt = {}

    get metadata() {
        if (this.id) return this.registry.items[this.id]
        if (this.runtimeId) return this.registry.itemsByRuntimeId[this.runtimeId]
        return {}
    }

    constructor(registry = undefined) {
        if (registry) this.registry = registry
    }

    init(version) {
        this.registry = new BedrockRegistry(version)
    }

    create(runtimeId = undefined, id = undefined, count = undefined) {
        if (runtimeId) {
            this.runtimeId = runtimeId
            this.id = this.registry.itemsByRuntimeId[runtimeId]?.id
        }
        if (id) this.id = id
        if (count) this.count = count
    }
}