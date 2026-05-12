import { BedrockPalettedStorage } from "#Base/BedrockStorage/BedrockPalletedStorage"
import { BedrockBiomeSection } from "#Base/BedrockWorld/bedrockObjects/BaseBedrockBiome"
import { V3, V3WorldToLocal } from "#extra/extraWorldFunctions"
import ByteStream from "prismarine-chunk/src/bedrock/common/Stream.js"
import * as pNbt from "prismarine-nbt"
import constants from "../constants.js"

export default class ChunkDecoder {
    /**
     * 
     * @param {import("#World/bedrockObjects/BaseBedrockChunk").BedrockChunk} BedrockChunk 
     * @param {*} payload 
     * @param {*} cache 
     * @returns 
     */
    static decodeNetwork(BedrockChunk, payload, cache = true) {
        /**
         * @type {ByteStream}
         */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }
        else return false

        for (let y = constants.minCY; stream.peek(); y++) {
            const biomeSection = new BedrockBiomeSection()
            biomeSection.position = { ...BedrockChunk.position, y }
            ChunkDecoder.loadBiome(stream, biomeSection)

            BedrockChunk.setBiomeSection(y, biomeSection)
        }

        const borderBlocks = stream.readBuffer(stream.readZigZagVarInt())
        if (borderBlocks.length) {
            throw new Error(`Can't handle border blocks (length: ${borderBlocks.length})`)
        }
        //this.loadNBTData(stream, BedrockChunk)
    }

    static loadNBTData(stream, BedrockChunk) {
        let startOffset = stream.readOffset
        while (stream.peek() === 0x0A) {
            const nbt = pNbt.protos.littleVarint.parsePacketBuffer('nbt', stream.buffer, startOffset)
            stream.readOffset += nbt.metadata.size
            startOffset += nbt.metadata.size
            const simply = pNbt.simplify(nbt.data)
            const { x, y, z, ...data } = simply

            const SubChunk = BedrockChunk.getSubChunk(y >> 4)
            if (!SubChunk) continue
            const local = V3WorldToLocal(V3(x, y, z))

            SubChunk.setBlockEntity(local.x, local.y, local.z, data)
        }
    }

    /**
     * 
     * @param {ByteStream} stream 
     * @param {import("#World/bedrockObjects/BaseBedrockChunk").BedrockChunk} BedrockChunk 
     * @returns 
     */
    static loadBiome(stream, biomeSection) {
        const paletteType = stream.readByte()
        const isRuntimeIds = (paletteType & 1) === 1
        if (!isRuntimeIds) throw new Error('This method decode only network data.')

        const bitsPerBlock = paletteType >> 1
        if (bitsPerBlock === 0) {
            biomeSection.palette.push(stream.readVarInt() >> 1)
            return
        }
        biomeSection.biomes = ChunkDecoder.loadBiomesStorage(stream, bitsPerBlock)

        const paletteSize = stream.readVarInt() >> 1
        biomeSection.palette = ChunkDecoder.loadBiomesPalette(stream, paletteSize)
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