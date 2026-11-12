import { BedrockPlugins } from "#Core/Storage/BedrockPlugins"
import { BedrockRegistry } from "#Storage/BedrockRegistry"

export class BedrockItemStack extends BedrockPlugins {
    /** @type {import("minecraft-data").IndexedData} */
    registry

    id = undefined
    runtimeId = undefined
    count = 0
    nbt = {}

    get metadata() { return this.id !== undefined ? this.registry.items[this.id] : this.registry.itemsByRuntimeId[this.runtimeId] }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
        return this
    }

    create(runtimeId, count) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        if (runtimeId) {
            this.id = this.registry.itemsByRuntimeId[runtimeId]?.id
            this.runtimeId = runtimeId
        }
        if (count) this.count = count
        return this
    }
}