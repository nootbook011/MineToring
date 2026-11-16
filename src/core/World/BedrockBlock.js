import { BedrockPlugins } from '#Storage/BedrockPlugins';
import { isV3, V3 } from '#extra/extraWorldFunctions';
import { BedrockRegistry } from "#Storage/BedrockRegistry"
import { hasData } from "#extra/extraFunctions";

export class BedrockBlock extends BedrockPlugins {
    /** @type {import("minecraft-data").IndexedData} */
    registry
    
    id = 0
    secondLayerId = 0
    stateId = undefined
    nbt = {}

    #position = V3(0, 0, 0)

    get metadata() { return this.registry.blocks[this.id] }
    get secondLayerMetadata() { return this.registry.blocks[this.secondLayerId] }
    get states() { return this.registry.blockStates[this.stateId]?.states }

    get name() { return this.metadata.name }
    get runtimeId() { return this.metadata.runtimeId }
    get secondLayerRuntimeId() { return this.secondLayerMetadata.runtimeId }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) {
            this.#position.x = v3.x
            this.#position.y = v3.y
            this.#position.z = v3.z
        }
        else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`)
    }

    static copyFrom(Block) {
        const newBlock = new BedrockBlock(Block.registry)
        newBlock.id = Block.id
        newBlock.secondLayerId = Block.secondLayerId
        newBlock.stateId = Block.stateId
        newBlock.nbt = structuredClone(Block.nbt)
        newBlock.position = Block.position
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

    create(id, secondLayerId, nbt, isRuntime = false) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        if (isRuntime) {
            const metadata = this.registry.blocksByRuntimeId[id]
            this.id = metadata?.id ?? 0
            this.stateId = metadata?.stateId

            this.secondLayerId = this.registry.blocksByRuntimeId[secondLayerId]?.id ?? 0
        }
        else {
            this.id = id ?? 0
            this.secondLayerId = secondLayerId ?? 0
            this.stateId = this.metadata.defaultState
        }

        if (hasData(nbt)) this.nbt = nbt

        return this
    }
}