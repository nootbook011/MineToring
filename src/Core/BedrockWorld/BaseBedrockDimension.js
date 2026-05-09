import { BedrockMap } from "#Storage/BaseBedrockMap"
import { EventEmitter } from 'node:events'

import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockProtocol, ProtocolLoader } from "#Main/Packets/ProtocolLoader";
import { packV3, V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { DimensionAccessError } from "#extra/errors";
import { BedrockBlock } from "./bedrockObjects/BaseBedrockBlock.js";
import { BlocksIterator, BlocksAreaIterator } from "#Base/BedrockStorage/BedrockBlocks";
import { BedrockThread } from "#Base/BedrockStorage/BedrockThread";

export class BedrockDimension extends BedrockPlugins {
    #protocol
    /**
     * @type {import("minecraft-data").IndexedData}
     */
    #registry
    #events = new EventEmitter()
    #map

    get #db() { return this.#protocol.parsers }

    get events() { return this.#events }
    get chunks() { return this.#map }
    get length() { return this.chunks.size }

    constructor() {
        super()
        this.#map = new BedrockMap()
    }

    async initProtocol(protocol = undefined, autoInit = true) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else if (autoInit) this.#protocol = await ProtocolLoader.getProtocol(this.version)
        else return
    }

    initRegistry(registry) {
        this.#registry = registry
    }

    _clear() {
        this.#map.clear()
    }

    /**
     * Retrieves the BedrockChunk at the specified coordinates.
     * @param {Number} x Chunk X
     * @param {Number} z Chunk Z
     * @returns {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk}
     */
    getChunk(x, z) {
        const Dmap = this.#map

        const BChunk = Dmap.getChunk(x, z)
        return BChunk
    }

    /**
     * Returns the full class of the block at the coordinates
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @returns {BedrockBlock}
     */
    getBlock(x, y, z) {
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) throw new DimensionAccessError(`Chunk at ${coords.x}, ${coords.z} is not loaded or corrupted, cannot load block data.`)

        const local = V3WorldToLocal(v3)
        const runId = chunk.getBlockId(local.x, v3.y, local.z, 0)
        if (!runId) throw new DimensionAccessError(`SubChunk at ${coords.x}, ${coords.y}, ${coords.z} is not loaded or corrupted, cannot load block data.`)

        const metadata = this.#registry.blocksByRuntimeId[runId]
        const block = new BedrockBlock(metadata, this.#registry.blockStates?.[metadata?.stateId]?.states)
        block.position = v3
        block.addExtraLayer(this.#registry.blocksByRuntimeId[chunk.getBlockId(local.x, v3.y, local.z, 1)]?.name)
        block.addEntityData(chunk.getSubChunk(coords.y).getBlockEntity(local.x, local.y, local.z))

        return block
    }

    /**
     * Returns an iterator with all the blocks in the area.
     * @param {{x, y, z}} from 
     * @param {{x, y, z}} to 
     */
    getBlocks(from, to) {
        return new BlocksAreaIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), from, to)
    }

    /**
     * Efficient method for searching data inside the world.
     * @param {(targetBlockMetadata: import("minecraft-data").Block) => Boolean} callBack
     * @param {{ x, y, z }} from 
     * @param {{ x, y, z }} to 
     * @returns {BlocksIterator}
     */
    findBlocks(callBack, from, to) {
        const min = {
            x: Math.min(from.x, to.x),
            y: Math.min(from.y, to.y),
            z: Math.min(from.z, to.z)
        }
        const max = {
            x: Math.max(from.x, to.x),
            y: Math.max(from.y, to.y),
            z: Math.max(from.z, to.z)
        }
        const minSubChunk = V3ToChunk(min)
        const maxSubChunk = V3ToChunk(max)
        const result = new BedrockThread()
        const targetIds = new Set()

        for (const [id, meta] of Object.entries(this.#registry.blocksByRuntimeId)) {
            if (callBack(meta)) targetIds.add(Number(id))
        }

        for (let y = minSubChunk.y; y <= maxSubChunk.y; y++) {
            for (let x = minSubChunk.x; x <= maxSubChunk.x; x++) {
                for (let z = minSubChunk.z; z <= maxSubChunk.z; z++) {
                    const subChunk = this.getChunk(x, z).getSubChunk(y)
                    if (!subChunk) continue
                    const palette = subChunk?.palette[0]
                    const localTargetIndices = new Uint8Array(palette.length)
                    let hasTargets = false

                    for (let i = 0; i < palette.length; i++) {
                        if (targetIds.has(palette[i])) {
                            localTargetIndices[i] = 1
                            hasTargets = true
                        }
                    }
                    if (!hasTargets) continue

                    const blocksStorage = subChunk?.blocks[0]?.getDecodedArray()
                    const len = blocksStorage.length

                    for (let i = 0; i < len; i += 4) {
                        const index = blocksStorage[i + 3]

                        if (localTargetIndices[index]) {
                            const x = blocksStorage[i]
                            const y = blocksStorage[i + 1]
                            const z = blocksStorage[i + 2]
                            result.add(packV3(x, y, z))
                        }
                    }
                }
            }
        }

        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), result)
    }
    
    findBlocksChunk(callBack, x, z) {
        const chunk = this.getChunk(x, z)
        if (!chunk || !chunk.hasSubChunks) return false
        
        const subs = Object.keys(chunk.subChunks)
        const minSubChunk = Math.min(...subs)
        const maxSubChunk = Math.max(...subs)
        
        const result = new BedrockThread()

        for (let y = minSubChunk.y; y <= maxSubChunk.y; y++) {
            const subChunk = chunk.getSubChunk(y)
            if (!subChunk) continue
            
            const palette = subChunk?.palette[0]
            const localTargetIndices = new Uint8Array(palette.length)
            let hasTargets = false

            for (let i = 0; i < palette.length; i++) {
                const metadata = this.#registry.blocksByRuntimeId[palette[i]]
                if (callBack(metadata)) {
                    localTargetIndices[i] = 1
                    hasTargets = true
                }
            }
            if (!hasTargets) continue

            const blocksStorage = subChunk?.blocks[0]?.getDecodedArray()
            const len = blocksStorage.length

            for (let i = 0; i < len; i += 4) {
                const index = blocksStorage[i + 3]

                if (localTargetIndices[index]) {
                    const x = blocksStorage[i]
                    const y = blocksStorage[i + 1]
                    const z = blocksStorage[i + 2]
                    result.add(packV3(x, y, z))
                }
            }
        }
        
        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), result)
    }
    findBlocksSubChunk(callBack, subChunk) {
        if (!subChunk) return false
        
        const result = new BedrockThread()
        const palette = subChunk?.palette[0]
        const localTargetIndices = new Uint8Array(palette.length)
        let hasTargets = false

        for (let i = 0; i < palette.length; i++) {
            const metadata = this.#registry.blocksByRuntimeId[palette[i]]
            if (callBack(metadata)) {
                localTargetIndices[i] = 1
                hasTargets = true
            }
        }
        if (!hasTargets) return false

        const blocksStorage = subChunk?.blocks[0]?.getDecodedArray()
        const len = blocksStorage.length

        for (let i = 0; i < len; i += 4) {
            const index = blocksStorage[i + 3]

            if (localTargetIndices[index]) {
                const x = blocksStorage[i]
                const y = blocksStorage[i + 1]
                const z = blocksStorage[i + 2]
                result.add(packV3(x, y, z))
            }
        }
        
        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), result)
    }
    
    /**
     * Adds packets to the dimension, it can be WorldPackets like level_chunk and subchunk, it will automatically parse them and add to the map.
     * @param {{ chunk: Object, subChunks: Object }} packets 
     */
    add(packets) {
        const { chunk, subChunks } = packets

        if (chunk) this.addChunk(chunk)
        if (subChunks) this.addSubChunks(subChunks)
    }

    /**
     * Adds a level chunk packet to the dimension, it will automatically parse it and add to the map.
     * @param {Object} levelChunkPacket 
     * @returns {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk} the added chunk
     */
    addChunk(levelChunkPacket) {
        const parser = this.#db.Chunk
        const bedrockMap = this.#map
        const blobsManager = this.plugins?.BlobsManager
        const BChunk = parser.buildChunk(levelChunkPacket, bedrockMap, blobsManager)

        return BChunk
    }

    /**
     * Adds subchunk packets to the dimension, it will automatically parse them and add to the map, it requires the chunk to be already added to the map.
     * @param {Object} subChunkPacket 
     */
    addSubChunks(subChunkPacket) {
        const parser = this.#db.Subchunk
        const bedrockMap = this.#map
        const blobsManager = this.plugins?.BlobsManager
        parser.buildSubChunks(subChunkPacket, bedrockMap, blobsManager)
    }
}