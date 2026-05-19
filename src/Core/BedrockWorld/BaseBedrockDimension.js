import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockProtocol, ProtocolLoader } from "#Packets/ProtocolLoader";
import { EventEmitter } from 'node:events'
import { BedrockMap } from "#Storage/Maps/BaseBedrockMap"
import { BedrockBlock } from "#World/bedrockObjects/BaseBedrockBlock"
import { BedrockChunk } from "#World/bedrockObjects/BaseBedrockChunk";
import { BlocksIterator, BlocksAreaIterator } from "#Storage/BedrockBlocks";
import { BedrockThread } from "#Storage/BedrockThread";
import { packV3, V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { ChunkAccessError } from "#extra/errors";

export class BedrockDimension extends BedrockPlugins {
    #protocol
    /**
     * @type {import("minecraft-data").IndexedData}
     */
    #registry
    #events = new EventEmitter()
    #map = new BedrockMap()

    constructor(protocol = undefined, registry = undefined) {
        super()
        if (protocol) this.protocol = protocol
        if (registry) this.registry = registry
    }

    get #parsers() { return this.#protocol.parsers }

    get events() { return this.#events }
    get chunks() { return this.#map }
    get length() { return this.chunks.size }

    get protocol() { return this.#protocol }
    set protocol(protocol) {
        if (protocol instanceof BedrockProtocol) {
            this.#protocol = protocol
        } else {
            throw new TypeError(`Instance of BedrockProtocol class is needed for initialization.`)
        }
    }

    get registry() { return this.#registry }
    set registry(registry) {
        this.#registry = registry
    }

    async init(version) {
        this.#protocol = await ProtocolLoader.getProtocol(version)
        this.#registry = new this.#protocol.BedrockRegistry(version)
        this.#registry.loadHashedRuntimeIds()
    }

    _clear() {
        this.#map.clear()
    }

    /**
     * Returns the BedrockChunk at the specified coordinates.
     * @param {Number} x Chunk X
     * @param {Number} z Chunk Z
     * @returns {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk}
     */
    getChunk(x, z) {
        const BChunk = this.#map.getChunk(x, z)
        return BChunk
    }

    /**
     * Returns the full class of the block at the world coordinates
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @returns {BedrockBlock}
     */
    getBlock(x, y, z) {
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${coords.x}, ${coords.z} is not loaded or corrupted, cannot load block data.`)

        const local = V3WorldToLocal(v3)
        return chunk.getBlock(local.x, y, local.z)
    }
    /**
     * Set block at the world coordinates
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @returns {BedrockBlock}
     */
    setBlock(block, x, y, z) {
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${coords.x}, ${coords.z} is not loaded or corrupted, cannot load block data.`)

        const local = V3WorldToLocal(v3)
        return chunk.setBlock(local.x, y, local.z)
    }

    /**
     * Returns an iterator with all the blocks in the area.
     * @param {{x, y, z}} from - World coordinates of area angle
     * @param {{x, y, z}} to - World coordinates of area angle
     */
    getBlocks(from, to) {
        return new BlocksAreaIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), from, to)
    }

    /**
     * Efficient method for searching data inside the world.
     * @param {(targetBlockMetadata: import("minecraft-data").Block) => Boolean} callBack
     * @param {{ x, y, z }} from - World coordinates of the search angle
     * @param {{ x, y, z }} to - World coordinates of the search angle
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

        for (const id in this.#registry.blocksByRuntimeId) {
            const value = this.#registry.blocksByRuntimeId[id]
            if (!(value?.id)) continue
            if (callBack(value)) targetIds.add(Number(id))
        }

        for (let y = minSubChunk.y; y <= maxSubChunk.y; y++) {
            for (let x = minSubChunk.x; x <= maxSubChunk.x; x++) {
                for (let z = minSubChunk.z; z <= maxSubChunk.z; z++) {
                    const subChunk = this.getChunk(x, z).getSubChunk(y, false)
                    if (!subChunk) continue
                    const subChunkWorldCoords = subChunk.from

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
                        const x = blocksStorage[i]
                        const y = blocksStorage[i + 1]
                        const z = blocksStorage[i + 2]

                        if (localTargetIndices[index]) {
                            const worldX = subChunkWorldCoords.x + blocksStorage[i]
                            const worldY = subChunkWorldCoords.y + blocksStorage[i + 1]
                            const worldZ = subChunkWorldCoords.z + blocksStorage[i + 2]

                            if (worldX >= min.x && worldX <= max.x &&
                                worldY >= min.y && worldY <= max.y &&
                                worldZ >= min.z && worldZ <= max.z) {

                                result.add(packV3(worldX, worldY, worldZ))
                            }
                        }
                    }
                }
            }
        }

        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), result)
    }

    /**
     * Returns the Biome Data from Minecraft-Data lib at the world coordinates
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    getBiome(x, y, z) {
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${coords.x}, ${coords.z} is not loaded or corrupted, cannot load block data.`)

        const local = V3WorldToLocal(v3)
        return chunk.getBiomeData(local.x, y, local.z)
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
     * Adds a chunk packet to the dimension, it will automatically parse it and add to the map.
     * @param {Object} levelChunkPacket 
     * @returns {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk} the added chunk
     */
    addChunk(chunkPacket) {
        const bedrockMap = this.#map
        
        const BChunk = new BedrockChunk(this.#protocol, this.#registry)
        BChunk.buildFromPacket(chunkPacket, this.plugins?.BlobsManager)
        bedrockMap.setChunk(BChunk, BChunk.position.x, BChunk.position.z)

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