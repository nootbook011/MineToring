import { BedrockPlugins } from '#Storage/BedrockPlugins';
import { isV3, V3 } from '#extra/extraWorldFunctions';
import { BedrockRegistry } from "#Storage/BedrockRegistry"
import { hasData } from "#extra/extraFunctions";

export class BedrockBlock extends BedrockPlugins {
    /** @type {import("minecraft-data").IndexedData} */
    registry
    
    id = 0
    runtimeId = undefined
    secondLayerRuntimeId = undefined
    stateId = undefined
    #position = V3(0, 0, 0)

    nbt = {}

    get metadata() { return this.registry.blocks[this.id] }
    get states() { return this.registry.blockStates[this.stateId]?.states || {} }
    
    get secondLayerBlock() {
        if (!this.secondLayerRuntimeId) return this.registry.blocks[0]
        return this.registry.blocksByRuntimeId[this.secondLayerRuntimeId]
    }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
    }

    create(runtimeId = undefined, secondLayerBlockRuntimeId = undefined, nbt = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        if (runtimeId) {
            const metadata = this.registry.blocksByRuntimeId[runtimeId]
            this.id = metadata.id
            this.stateId = metadata.stateId
            this.runtimeId = runtimeId
        }
        if (secondLayerBlockRuntimeId) this.secondLayerRuntimeId = secondLayerBlockRuntimeId
        if (hasData(nbt)) this.nbt = nbt
    }

    get position() { return this.#position }
    set position(v3) { if (isV3(v3)) Object.assign(this.#position, v3); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }
}