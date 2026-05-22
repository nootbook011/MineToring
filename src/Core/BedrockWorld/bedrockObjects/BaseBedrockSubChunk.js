import { ChunkToV3, getIndexV3, isV3, V2, V3, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";
import { PalettedStorage, ProxyPalettedStorage } from "#Storage/Binary/PalettedStorage";
import PBlock from "prismarine-block";
import { BedrockBlock } from "./BaseBedrockBlock.js";

export class BedrockSubChunk extends BedrockObjectStorage {
    #position = V3(0, 0, 0)
    dimension = 0

    /** @type {Array<PalettedStorage>} */
    #blocks = []
    /** @type {Map<number, object>} */
    #blockEntities = new Map()

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }
    get from() { return ChunkToV3(this.position) }
    get to() {
        const to = this.from
        return V3(
            to.x + 15,
            to.y + 15,
            to.z + 15
        )
    }

    create(x, y, z, dimension) {
        this.dimension = dimension
        this.position = V3(x, y, z)
    }

    get hasBlocks() { return !!this.#blocks[0]?.palette?.length > 0 }
    get blocks() { return this.#blocks }

    setPayload(payload, cache) {
        const decoder = this.protocol.decoders.SubChunkDecoder
        if (!decoder) throw new Error(`Cannot load SubChunkDecoder`)
        
        if (payload?.length > 1) {
            decoder.decodeNetwork(this, payload, cache)
            return true
        }
        else return false
    }
    setBlocksEntityPayload(payload) {
        const decoder = this.protocol.decoders.SubChunkDecoder
        if (!decoder) throw new Error(`Cannot load SubChunkDecoder`)
        
        if (payload?.length > 1) {
            decoder.loadNBTData(this, payload)
            return true
        }
        else return false
    }

    getLayer(layer) {
        const blocks = this.#blocks
        blocks[layer] ??= new PalettedStorage().create()
        if (blocks[layer] instanceof ProxyPalettedStorage) blocks[layer] = blocks[layer].create()
        
        return blocks[layer]
    }
    setLayer(layer, storage) {
        if (storage instanceof PalettedStorage || storage instanceof ProxyPalettedStorage) this.#blocks[layer] = storage
        else throw new TypeError(`Blocks must be PalettedStorage or ProxyPalettedStorage!`)
    }

    getBlock(x, y, z) {
        const runId = this.getBlockId(x, y, z, 0)

        const metadata = runId ? this.registry.blocksByRuntimeId[runId] : this.registry.blocksByName.air
        const states = runId ? this.registry.blockStates[metadata?.stateId]?.states : undefined
        const block = new BedrockBlock(metadata, states)

        const pos = ChunkToV3(this.position)
        block.position = { x: pos.x + x, y: pos.y + y, z: pos.z + z }
        if (runId) {
            const extraRunId = this.getBlockId(x, y, z, 1)
            if (extraRunId) block.setExtraLayer(this.registry.blocksByRuntimeId[extraRunId]?.name)
            block.setEntityData(this.getBlockEntity(x, y, z))
        }

        return block
    }
    setBlock(block, x, y, z) {
        const Block = PBlock(this.registry)
        const { rawStates, rawEntityNBT, metadata, fillBlock } = block
        if (!rawStates || !metadata?.name) return false

        const runIdMain = Block.getHash(metadata.name, rawStates)
        const runIdExtra = Block.getHash(fillBlock, {})
        this.setBlockId(x, y, z, 0, runIdMain)
        this.setBlockId(x, y, z, 1, runIdExtra)

        if (Object.keys(rawEntityNBT).length) this.setBlockEntity(x, y, z, rawEntityNBT)
        return true
    }

    getBlockEntity(x, y, z) { return this.#blockEntities.get(getIndexV3(x, y, z)) }
    setBlockEntity(x, y, z, rawNBT) { this.#blockEntities.set(getIndexV3(x, y, z), rawNBT) }

    getBlockId(x, y, z, l) { return this.getLayer(l).get(x, y, z) }
    setBlockId(x, y, z, l, id) { this.getLayer(l).set(x, y, z, id) }
}