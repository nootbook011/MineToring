import { ChunkToV3, isV3, packChunkV3, V3 } from "#extra/extraWorldFunctions";
import { PalettedStorage, ProxyPalettedStorage } from "#Storage/Binary/PalettedStorage";
import { BedrockBlock } from "./BedrockBlock.js";
import { BedrockRegistry } from "#Storage/BedrockRegistry"
import { hasData } from "#extra/extraFunctions";

export class BedrockSubChunk {
    /** @type {import("minecraft-data").IndexedData} */
    registry

    #position = V3(0, 0, 0)
    dimension = 0

    /** @type {Array<PalettedStorage>} */
    blocks = []
    /** @type {Map<number, object>} */
    blockEntities = new Map()

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) {
            this.#position.x = v3.x
            this.#position.y = v3.y
            this.#position.z = v3.z
        }
        else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`)
    }

    get from() { return ChunkToV3(this.#position.x, this.#position.y, this.#position.z) }
    get to() {
        const to = this.from
        return V3(
            to.x + 15,
            to.y + 15,
            to.z + 15
        )
    }

    constructor(registryOrVersion) {
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
        return this
    }

    create(x, y, z, dimension) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        this.dimension = dimension
        this.position = V3(x, y, z)
        return this
    }

    get hasBlocks() {
        const layer = this.getLayer(0, true)
        return !!layer && !layer.isEmpty
    }

    getOrCreateLayer(layer) {
        return this.getLayer(layer) ?? this.createLayer(layer)
    }
    createLayer(layer) {
        const blocks = this.blocks
        const storage = new PalettedStorage().create()
        storage.palette[0] = 0

        blocks[layer] = storage
        return storage
    }

    getLayer(layer, lazy = false) {
        const blocks = this.blocks
        if (!lazy && blocks[layer] instanceof ProxyPalettedStorage) blocks[layer] = blocks[layer].create()
        return blocks[layer]
    }
    setLayer(layer, storage) {
        if (storage instanceof PalettedStorage || storage instanceof ProxyPalettedStorage) this.blocks[layer] = storage
        else throw new TypeError(`Expected PalettedStorage or ProxyPalettedStorage, received: ${typeof storage}`)
    }

    getBlock(x, y, z) {
        const runId = this.getBlockId(x, y, z, 0)
        const extraRunId = this.getBlockId(x, y, z, 1)
        const nbt = this.getBlockEntity(x, y, z)
        const pos = this.from

        const block = new BedrockBlock(this.registry)
        block.create(runId, extraRunId, nbt)
        block.position = { x: pos.x + x, y: pos.y + y, z: pos.z + z }

        return block
    }
    /**
     * 
     * @param {BedrockBlock} block 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    setBlock(x, y, z, block) {
        const runtimeIdMain = block.runtimeId
        const runtimeIdExtra = block.secondLayerRuntimeId
        const nbt = block.nbt

        if (
            Number.isFinite(runtimeIdMain) &&
            (runtimeIdMain !== 0 || this.blocks[0] !== undefined)
        ) this.setBlockId(x, y, z, 0, runtimeIdMain)

        if (
            Number.isFinite(runtimeIdExtra) &&
            (runtimeIdExtra !== 0 || this.blocks[1] !== undefined)
        ) this.setBlockId(x, y, z, 1, runtimeIdExtra)

        if (hasData(nbt)) this.setBlockEntity(x, y, z, nbt)
        else this.deleteBlockEntity(x, y, z)
    }

    hasBlockEntity(x, y, z) { return this.blockEntities.has(packChunkV3(x, y, z)) }
    getBlockEntity(x, y, z) { return this.blockEntities.get(packChunkV3(x, y, z)) }
    setBlockEntity(x, y, z, rawNBT) { this.blockEntities.set(packChunkV3(x, y, z), rawNBT) }
    deleteBlockEntity(x, y, z) { return this.blockEntities.delete(packChunkV3(x, y, z)) }

    getBlockId(x, y, z, l) { return this.getLayer(l, true)?.get(x, y, z) ?? 0 }
    setBlockId(x, y, z, l, id) { this.getOrCreateLayer(l).set(x, y, z, id) }
}