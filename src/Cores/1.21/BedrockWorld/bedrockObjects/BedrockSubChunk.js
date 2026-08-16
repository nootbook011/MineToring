import { ChunkToV3, getIndexV3, isV3, toSignedIndex, V3, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { PalettedStorage, ProxyPalettedStorage } from "../../BedrockStorage/Binary/PalettedStorage.js";
import PBlock from "prismarine-block";
import { BedrockBlock } from "./BedrockBlock.js";
import { ByteStream } from "../../BedrockStorage/Binary/ByteStream.js";
import * as pNbt from "prismarine-nbt";
import { BedrockRegistry } from "../../index.js"

export class BedrockSubChunk {
    /** @type {import("minecraft-data").IndexedData} */
    #registry

    #position = V3(0, 0, 0)
    dimension = 0

    /** @type {Array<PalettedStorage>} */
    #blocks = []
    /** @type {Map<number, object>} */
    #blockEntities = new Map()

    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return Object.assign(this.#position, v3)
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

    constructor(registry = undefined) {
        if (registry) this.registry = registry
    }

    init(version) {
        this.#registry = new BedrockRegistry(version)
    }

    create(x, y, z, dimension) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        this.dimension = dimension
        this.position = V3(x, y, z)
    }

    get hasBlocks() { return this.#blocks[0]?.isEmpty }
    get blocks() { return this.#blocks }

    /*
    * thanks prismarine-chunk library for code reference 
    */
    /**
     * Decodes payload data sent over the bedrock protocol
     * @param {Array} payload 
     * @param {Boolean} cache payload data cached status
     * @returns {Boolean}
     */
    setPayload(payload, cache = this.payloadCache) {
        if (!(payload?.length > 1)) return false

        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        if (!cache && stream.peek() === 0x0A) return this.setBlocksEntityPayload(stream)

        const version = stream.readByte()
        if (version !== 9) {
            throw new Error(`This protocol support only 9 subChunksVersion, subChunk version is ${version}`)
        }
        const layersCount = stream.readByte()
        const subChunkY = toSignedIndex(stream.readByte())
        if (subChunkY !== this.position.y) {
            console.warn(`Mismatch of Y coordinat between payload and packet: ${this.position.y} packet, ${subChunkY} payload. \nAutomatically trust payload data.`)
            this.position.y = subChunkY
        }

        for (let l = 0; l < layersCount; l++) {
            const paletteType = stream.readByte()
            const isRuntimeIds = (paletteType & 1) === 1
            if (!isRuntimeIds) throw new Error('This method decode only network data.')

            const storage = new PalettedStorage()
            const bitsPerBlock = paletteType >> 1
            storage.create(bitsPerBlock)
            storage.read(stream)
            const paletteSize = stream.readZigZagVarInt()
            storage.palette = []

            for (let i = 0; i < paletteSize; i++) {
                storage.palette[i] = stream.readZigZagVarInt()
            }

            this.setLayer(l, storage)
        }

        return true
    }
    setBlocksEntityPayload(payload) {
        if (!(payload?.length > 1)) return false

        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        let startOffset = stream.readOffset
        while (stream.peek() === 0x0A) {
            const nbt = pNbt.protos.littleVarint.parsePacketBuffer('nbt', stream.buffer, startOffset)
            stream.readOffset += nbt.metadata.size
            startOffset += nbt.metadata.size
            const simply = pNbt.simplify(nbt.data)
            const { x, y, z } = simply
            const local = V3WorldToLocal(V3(x, y, z))

            this.setBlockEntity(local.x, local.y, local.z, nbt.data)
        }

        return true
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
        const block = new BedrockBlock(this.registry)
        block.create(runId)

        const pos = this.from
        block.position = { x: pos.x + x, y: pos.y + y, z: pos.z + z }

        if (runId) {
            const extraRunId = this.getBlockId(x, y, z, 1)
            if (extraRunId) block.secondLayerBlockId = this.registry.blocksByRuntimeId[extraRunId]?.id
            block.entityNBT = this.getBlockEntity(x, y, z)
        }

        return block
    }
    /**
     * 
     * @param {BedrockBlock} block 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    setBlock(block, x, y, z) {
        const Block = PBlock(this.registry)

        const runIdMain = Block.getHash(block.metadata.name, block.states)
        const runIdExtra = Block.getHash(block.secondLayerBlock.name, {})
        this.setBlockId(x, y, z, 0, runIdMain)
        this.setBlockId(x, y, z, 1, runIdExtra)

        if (Object.keys(block.entityNBT ?? {}).length) this.setBlockEntity(x, y, z, block.entityNBT)
    }

    getBlockEntity(x, y, z) { return this.#blockEntities.get(getIndexV3(x, y, z)) }
    setBlockEntity(x, y, z, rawNBT) { this.#blockEntities.set(getIndexV3(x, y, z), rawNBT) }

    getBlockId(x, y, z, l) { return this.getLayer(l).get(x, y, z) }
    setBlockId(x, y, z, l, id) { this.getLayer(l).set(x, y, z, id) }
}