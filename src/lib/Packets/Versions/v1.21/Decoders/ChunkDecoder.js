import { BedrockPalettedStorage } from "#Storage/Binary/BedrockPalletedStorage"
import { BedrockBiomeSection, BedrockProxyBiomeSection } from "#World/bedrockObjects/BaseBedrockBiome"
import { V3, V3WorldToLocal } from "#extra/extraWorldFunctions"
import { ByteStream } from "#Storage/Binary/ByteStream"
import * as pNbt from "prismarine-nbt"
import constants from "../constants.js"

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
    static decodeNetwork(BedrockChunk, payload, cache = true) {
        /** @type {ByteStream} */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        ChunkDecoder.loadBiomes(BedrockChunk, stream)

        if (!cache && stream.peek() !== undefined) {
            this.decodeBorderBlocks(BedrockChunk, stream)
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

        let proxy
        for (let y = constants.minCY; y <= constants.maxCY; y++) {
            if (stream.peek() === 0xff) {
                if (!proxy) throw new Error(`Cannot use last section.`)
                BedrockChunk.setBiomeSection(y, proxy)
                continue
            }

            const biomeSection = BedrockChunk.createBiomeSection(y)
            const paletteType = stream.readByte()
            const isRuntimeIds = (paletteType & 1) === 1
            if (!isRuntimeIds) throw new Error('This method decode only network data.')

            const bitsPerBlock = paletteType >> 1
            if (bitsPerBlock === 0) {
                biomeSection.palette.push(stream.readVarInt() >> 1)
            }
            else {
                biomeSection.biomes = ChunkDecoder.loadBiomesStorage(stream, bitsPerBlock)
                const paletteSize = stream.readVarInt() >> 1
                biomeSection.palette = ChunkDecoder.loadBiomesPalette(stream, paletteSize)
            }

            if (stream.peek() === 0xff) proxy = new BedrockProxyBiomeSection(biomeSection)
        }
    }

    static loadBiomesStorage(stream, bitsPerBlock) {
        const biomes = new BedrockPalettedStorage(bitsPerBlock)
        biomes.read(stream)
        return biomes
    }

    static loadBiomesPalette(stream, paletteSize) {
        const palette = []

        for (let i = 0; i < paletteSize; i++) {
            palette[i] = stream.readVarInt() >> 1
        }

        return palette
    }
}