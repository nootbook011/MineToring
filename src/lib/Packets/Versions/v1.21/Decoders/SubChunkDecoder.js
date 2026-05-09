import ByteStream from "prismarine-chunk/src/bedrock/common/Stream.js";
import PalettedStorage from "prismarine-chunk/src/bedrock/common/PalettedStorage.js";
import { toSignedIndex, V3, V3WorldToLocal } from "#extra/extraWorldFunctions";
import * as pNbt from "prismarine-nbt";
import { BedrockBlocksStorage } from "#Base/BedrockStorage/BedrockBlocksStorage";

/*
 * Almost all of the subchunk decoding code was taken from the prismarine-chunk library.
 * For optimizations reason, the library itself could not be used. 
*/

export default class SubChunkDecoder {
    /**
     * 
     * @param {import("#World/bedrockObjects/BaseBedrockSubChunk").BedrockSubChunk} BedrockSubChunk 
     * @param {*} payload 
     * @param {*} cache 
     * @returns 
     */
    static decodeNetwork(BedrockSubChunk, payload, cache = true) {
        /**
         * @type {ByteStream}
         */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }
        else return false
        if (cache && stream.peek() === 0x0A) {
            return SubChunkDecoder.loadNBTData(stream, BedrockSubChunk)
        }

        const version = stream.readByte()
        if (version !== 9) {
            throw new Error(`Protocol subChunksVersion support only 9, subChunk version is ${version}`)
        }
        const layersCount = stream.readByte()
        if (layersCount > 2) {
            // This is technically not an error, but not currently aware of any servers
            // that send more than two layers. If this is a problem, this check can be
            // safely removed. Just keeping it here as a sanity check.
            console.warn('Expected storage count to be 1 or 2, got ' + storageCount)
        }

        const subChunkY = toSignedIndex(stream.readByte())
        if (subChunkY !== BedrockSubChunk.position.y) {
            console.warn(`Mismatch of Y coordinat between payload and packet: ${BedrockSubChunk.position.y} packet, ${subChunkY} payload. \nAutomatically trust payload data.`)
            BedrockSubChunk.position.y = subChunkY
        }

        for (let l = 0; l < layersCount; l++) {
            const paletteType = stream.readByte()
            const isRuntimeIds = (paletteType & 1) === 1

            const bitsPerBlock = paletteType >> 1
            BedrockSubChunk.blocks[l] = SubChunkDecoder.loadBlocksStorage(stream, bitsPerBlock)

            const paletteSize = stream.readZigZagVarInt()
            if (isRuntimeIds) BedrockSubChunk.palette[l] = SubChunkDecoder.loadRuntimePalette(stream, paletteSize)
            else throw new Error('This method decode only network data.')
        }

        if (!cache && stream.peek() === 0x0A) {
            SubChunkDecoder.loadNBTData(stream, BedrockSubChunk)
        }
    }

    static loadNBTData(stream, BedrockSubChunk) {
        let startOffset = stream.readOffset
        while (stream.peek() === 0x0A) {
            const nbt = pNbt.protos.littleVarint.parsePacketBuffer('nbt', stream.buffer, startOffset)
            stream.readOffset += nbt.metadata.size
            startOffset += nbt.metadata.size
            const simply = pNbt.simplify(nbt.data)
            const { x, y, z, ...data } = simply
            const local = V3WorldToLocal(V3(x, y, z))

            BedrockSubChunk.setBlockEntity(local.x, local.y, local.z, data)
        }
    }

    static loadBlocksStorage(stream, bitsPerBlock, layer) {
        const storage = new BedrockBlocksStorage(bitsPerBlock)
        storage.read(stream)
        return storage
    }

    static loadRuntimePalette(stream, paletteSize) {
        const palette = []

        for (let i = 0; i < paletteSize; i++) {
            palette[i] = stream.readZigZagVarInt()
        }

        return palette
    }
}