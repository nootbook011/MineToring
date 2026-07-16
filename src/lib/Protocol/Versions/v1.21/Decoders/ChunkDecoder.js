import { V3, V3WorldToLocal } from "#extra/extraWorldFunctions"
import { ByteStream } from "#Storage/Binary/ByteStream"
import * as pNbt from "prismarine-nbt"
import constants from "../constants.js"
import { PalettedStorage, ProxyPalettedStorage } from "#Base/BedrockStorage/Binary/PalettedStorage"

/*
 * thanks prismarine-chunk library for code reference 
*/

export default class ChunkDecoder {
    /**
     * 
     * @param {import("#World/bedrockObjects/BaseBedrockChunk").BedrockChunk} BedrockChunk 
     * @param {*} payload 
     * @param {*} cache 
     * @returns 
     */
    static decodeNetwork(BedrockChunk, payload, cache) {
        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        ChunkDecoder.loadBiomes(BedrockChunk, stream)

        if (!cache && stream.peek() !== undefined) {
            ChunkDecoder.decodeBorderBlocks(BedrockChunk, stream)
        }
    }

    static decodeBorderBlocks(BedrockChunk, payload) {
        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream) && payload?.length > 1) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        const countByte = stream.readByte()
        const count = countByte === 0 ? 256 : countByte

        for (let i = 0; i < count; i++) {
            if (stream.peek() === undefined) break

            const packedXZ = stream.readByte()
            const z = packedXZ >> 4
            const x = packedXZ & 0x0F

            BedrockChunk.setBorder(x, z, true)
        }
    }

    /**
     * 
     * @param {Array} payload 
     * @param {import("#World/bedrockObjects/BaseBedrockChunk").BedrockChunk} BedrockChunk 
     * @returns 
     */
    static loadBiomes(BedrockChunk, payload) {
        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }
        const dimData = constants.dimensions[BedrockChunk.dimension]

        let proxy
        for (let y = dimData.minCY; y <= dimData.maxCY; y++) {
            if (stream.peek() === 0xff) {
                if (!proxy) throw new Error(`Cannot use last section.`)
                BedrockChunk.setBiomeSection(y, proxy)
                continue
            }

            const storage = new PalettedStorage()
            const paletteType = stream.readByte()
            const isRuntimeIds = (paletteType & 1) === 1
            if (!isRuntimeIds) throw new Error('This method decode only network data.')

            const bitsPerBlock = paletteType >> 1
            storage.create(bitsPerBlock)

            if (bitsPerBlock === 0) storage.palette.push(stream.readVarInt() >> 1)
            else {
                storage.read(stream)
                storage.palette = ChunkDecoder.loadBiomesPalette(stream)
            }

            BedrockChunk.setBiomeSection(y, storage)

            if (stream.peek() === 0xff) proxy = new ProxyPalettedStorage(storage)
        }
    }

    static loadBiomesPalette(stream) {
        const paletteSize = stream.readVarInt() >> 1
        const palette = []

        for (let i = 0; i < paletteSize; i++) {
            palette[i] = stream.readVarInt() >> 1
        }

        return palette
    }
}