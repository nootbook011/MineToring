import { ChunkToV3, isV3, packV3, toSignedIndex, V3, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { PalettedStorage, ProxyPalettedStorage } from "../../Storage/Binary/PalettedStorage.js";
import { BedrockBlock } from "./BedrockBlock.js";
import { ByteStream } from "../../Storage/Binary/ByteStream.js";
import * as pNbt from "prismarine-nbt";
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
    set position(v3) { if (isV3(v3)) Object.assign(this.#position, v3); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }

    get from() { return ChunkToV3(this.position) }
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
    }

    create(x, y, z, dimension) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        this.dimension = dimension
        this.position = V3(x, y, z)
    }

    hasBlocks() {
        const layer = this.getLayer(0, true)
        return layer && !layer.isEmpty()
    }

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

            const storage = this.createLayer(l)
            const bitsPerBlock = paletteType >> 1
            storage.create(bitsPerBlock)
            storage.read(stream)

            const paletteSize = stream.readZigZagVarInt()
            for (let i = 0; i < paletteSize; i++) {
                storage.palette[i] = stream.readZigZagVarInt()
            }
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

    getOrCreateLayer(layer) {
        return this.getLayer(layer) ?? this.createLayer(layer)
    }
    createLayer(layer) {
        const blocks = this.blocks
        blocks[layer] = new PalettedStorage().create()
        return blocks[layer]
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
    setBlock(block, x, y, z) {
        const runtimeIdMain = block.runtimeId
        const runtimeIdExtra = block.secondLayerBlockRuntimeId
        const nbt = block.nbt

        if (runtimeIdMain) this.setBlockId(x, y, z, 0, runtimeIdMain)
        if (runtimeIdExtra) this.setBlockId(x, y, z, 1, runtimeIdExtra)
        if (hasData(nbt)) this.setBlockEntity(x, y, z, nbt)
    }

    getBlockEntity(x, y, z) { return this.blockEntities.get(packV3(x, y, z)) }
    setBlockEntity(x, y, z, rawNBT) { this.blockEntities.set(packV3(x, y, z), rawNBT) }

    getBlockId(x, y, z, l) { return this.getLayer(l, true)?.get(x, y, z) }
    setBlockId(x, y, z, l, id) { this.getOrCreateLayer(l).set(x, y, z, id) }
}