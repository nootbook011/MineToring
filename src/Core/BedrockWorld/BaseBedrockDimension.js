import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { EventEmitter } from 'node:events'
import { BedrockMap } from "#Storage/Maps/BaseBedrockMap"
import { BedrockChunk } from "#World/bedrockObjects/BaseBedrockChunk";
import { BlocksIterator } from "#Base/BedrockStorage/BedrockBlocks";
import { BedrockThread } from "#Storage/BedrockThread";
import { packV3, V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { ChunkAccessError } from "#extra/errors";

export class BedrockDimension extends BedrockPlugins {
    #id = 0
    #events = new EventEmitter()
    #map = new BedrockMap()
    
    get id() { return this.#id }

    get events() { return this.#events }
    get chunks() { return this.#map }
    get length() { return this.chunks.size }
    
    create(dimensionId) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        this.#id = dimensionId
    }
    _clear() { this.#map.clear() }

    /**
     * Returns the BedrockChunk at the specified coordinates.
     * @param {number} x Chunk X
     * @param {number} z Chunk Z
     * @returns {BedrockChunk}
     */
    getChunk(x, z) {
        const BChunk = this.#map.getChunk(x, z)
        return BChunk
    }

    /**
     * Returns the BedrockSubChunk at the specified coordinates.
     * @param {number} x Chunk X
     * @param {number} y Chunk Y
     * @param {number} z Chunk Z
     * @returns {import("#World/bedrockObjects/BaseBedrockSubChunk").BedrockSubChunk}
     */
    getSubChunk(x, y, z) {
        const BChunk = this.#map.getChunk(x, z)
        return BChunk?.getSubChunk(y)
    }

    /**
     * Returns the full class of the block at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {import("#World/bedrockObjects/BaseBedrockBlock").BedrockBlock}
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
     * @param {number} x
     * @param {number} y
     * @param {number} z
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
        const thread = new BedrockThread()
        from = V3(Math.min(from.x, to.x), Math.min(from.y, to.y), Math.min(from.z, to.z))
        to = V3(Math.max(from.x, to.x), Math.max(from.y, to.y), Math.max(from.z, to.z))
        let { x, y, z } = from
        let done = false

        while (!done) {
            const packed = packV3(V3(x, y, z))
            thread.add(packed)
            y++
            if (y > to.y) {
                y = from.y
                z++
                if (z > to.z) {
                    z = from.z
                    x++
                    if (x > to.x) done = true
                }
            }
        }

        return new BlocksIterator((v3) => {
            try {
                return this.getBlock(v3.x, v3.y, v3.z)
            } catch (e) {
                if (e instanceof ChunkAccessError) return false
                else throw e
            }
        }, thread)
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

        for (const id in this.registry.blocksByRuntimeId) {
            const value = this.registry.blocksByRuntimeId[id]
            if (!(value?.id)) continue
            if (callBack(value)) targetIds.add(Number(id))
        }

        for (let y = minSubChunk.y; y <= maxSubChunk.y; y++) {
            for (let x = minSubChunk.x; x <= maxSubChunk.x; x++) {
                for (let z = minSubChunk.z; z <= maxSubChunk.z; z++) {
                    const chunk = this.getChunk(x, z)
                    if (!chunk) {
                        console.warn(`Chunk ${x} ${z} dont load, skip..`)
                        continue
                    }
                    const subChunk = chunk.getSubChunk(y, false)
                    if (!subChunk || !subChunk.blocks.length) continue
                    const subChunkWorldCoords = subChunk.from
                    const storage = subChunk.blocks[0]

                    const localTargetIndices = new Uint8Array(storage.palette.length)
                    let hasTargets = false

                    for (let i = 0; i < storage.palette.length; i++) {
                        if (targetIds.has(storage.palette[i])) {
                            localTargetIndices[i] = 1
                            hasTargets = true
                        }
                    }
                    if (!hasTargets) continue

                    storage.forEach((index, offset, i) => {
                        const pindex = storage.readBits(index, offset)
                        const y = i & 0xf
                        const z = (i >> 4) & 0xf
                        const x = (i >> 8) & 0xf

                        if (localTargetIndices[pindex]) {
                            const worldX = subChunkWorldCoords.x + x
                            const worldY = subChunkWorldCoords.y + y
                            const worldZ = subChunkWorldCoords.z + z

                            if (worldX >= min.x && worldX <= max.x &&
                                worldY >= min.y && worldY <= max.y &&
                                worldZ >= min.z && worldZ <= max.z) {

                                result.add(packV3(worldX, worldY, worldZ))
                            }
                        }
                    })
                }
            }
        }

        return new BlocksIterator((v3) => this.getBlock(v3.x, v3.y, v3.z), result)
    }

    /**
     * Returns the Biome Data from Minecraft-Data lib at the world coordinates
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    getBiome(x, y, z) {
        const v3 = V3(x, y, z)
        const coords = V3ToChunk(v3)
        const chunk = this.getChunk(coords.x, coords.z)
        if (!chunk) throw new ChunkAccessError(`Chunk at ${coords.x}, ${coords.z} is not loaded or corrupted, cannot load block data.`)

        const local = V3WorldToLocal(v3)
        return chunk.getBiome(local.x, y, local.z)
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
     * @returns {BedrockChunk} the added chunk
     */
    addChunk(chunkPacket) {
        const bedrockMap = this.#map

        const BChunk = new BedrockChunk(this.registry)
        BChunk.buildFromPacket(chunkPacket, this.plugins?.BlobsManager)
        bedrockMap.setChunk(BChunk, BChunk.position.x, BChunk.position.z)

        return BChunk
    }

    /**
     * Adds subchunk packets to the dimension, it will automatically parse them and add to the map, it requires the chunk to be already added to the map.
     * @param {Object} subChunkPacket 
     */
    addSubChunks(subChunkPacket) {
        const { entries, origin, cache_enabled: cache } = subChunkPacket
        let chunk

        for (const entry of entries) {
            const pos = V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
            if (chunk?.position?.x !== pos.x || chunk?.position?.z !== pos.z) {
                chunk = this.#map.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }

            const { payload, heightmap, result, blob_id: hash } = entry
            const BSubChunk = chunk.createSubChunk(pos.y)
            if (!BSubChunk) continue

            if (cache) BSubChunk.setBlocksEntityPayload(payload)
            else BSubChunk.setPayload(payload, cache)
            
            if (cache && this.plugins?.BlobsManager && result === 'success') this.plugins.BlobsManager.addHash(hash, BSubChunk)
        }
    }
}