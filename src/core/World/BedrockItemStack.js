import { BedrockPlugins } from "#Core/Storage/BedrockPlugins"
import { hasData } from "#extra/extraFunctions"
import { BedrockRegistry } from "#Storage/BedrockRegistry"

export class BedrockItemStack extends BedrockPlugins {
    /** @type {import("minecraft-data").IndexedData} */
    registry

    id = undefined
    count = 0
    nbt = {}

    get name() { return this.metadata.name }
    /** @type {import("minecraft-data").Item|undefined} */
    get metadata() { return this.registry.items[this.id] }

    static copyFrom(itemStack) {
        const newItemStack = new BedrockItemStack(itemStack.registry)
        newItemStack.id = itemStack.id
        newItemStack.runtimeId = itemStack.runtimeId
        newItemStack.count = itemStack.count
        newItemStack.nbt = structuredClone(itemStack.nbt)
        return newItemStack
    }

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

    create(id, count, nbt, isRuntime = false) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        if (isRuntime) this.id = this.registry.itemsByRuntimeId[id].id
        else this.id = id
        this.count = count ?? 0
        if (hasData(nbt)) this.nbt = nbt

        return this
    }
}