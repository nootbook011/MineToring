import { ByteStream } from "#Storage/Binary/ByteStream";
import { toSignedIndex, V3, V3WorldToLocal } from "#extra/extraWorldFunctions";
import * as pNbt from "prismarine-nbt";
import { PalettedStorage } from "#Storage/Binary/PalettedStorage";

/*
 * thanks prismarine-chunk library for code reference 
*/

export default class SubChunkDecoder {
    /**
     * 
     * @param {import("#World/bedrockObjects/BaseBedrockSubChunk").BedrockSubChunk} BedrockSubChunk 
     * @param {*} payload 
     * @param {*} cache 
     * @returns 
     */
    static decodeNetwork(BedrockSubChunk, payload, cache) {
        /**
         * @type {ByteStream}
         */
        let stream = payload
        if (!(payload instanceof ByteStream)) {
            if (Array.isArray(payload)) stream = Buffer.from(payload)
            stream = new ByteStream(stream)
        }

        const version = stream.readByte()
        if (version !== 9) {
            throw new Error(`This protocol support only 9 subChunksVersion, subChunk version is ${version}`)
        }
        const layersCount = stream.readByte()
        if (layersCount > 2) {
            // This is technically not an error, but not currently aware of any servers
            // that send more than two layers. If this is a problem, this check can be
            // safely removed. Just keeping it here as a sanity check.
            console.warn('Expected storage count to be 1 or 2, got ' + layersCount)
        }

        const subChunkY = toSignedIndex(stream.readByte())
        if (subChunkY !== BedrockSubChunk.position.y) {
            console.warn(`Mismatch of Y coordinat between payload and packet: ${BedrockSubChunk.position.y} packet, ${subChunkY} payload. \nAutomatically trust payload data.`)
            BedrockSubChunk.position.y = subChunkY
        }

        for (let l = 0; l < layersCount; l++) {
            const paletteType = stream.readByte()
            const isRuntimeIds = (paletteType & 1) === 1
            if (!isRuntimeIds) throw new Error('This method decode only network data.')
            
            const storage = new PalettedStorage()
            const bitsPerBlock = paletteType >> 1
            storage.create(bitsPerBlock)
            storage.read(stream)
            storage.palette = SubChunkDecoder.loadRuntimePalette(stream)

            BedrockSubChunk.setLayer(l, storage)
        }

        if (!cache && stream.peek() === 0x0A) {
            SubChunkDecoder.loadNBTData(stream, BedrockSubChunk)
        }
    }

    static loadNBTData(payload, BedrockSubChunk) {
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

            BedrockSubChunk.setBlockEntity(local.x, local.y, local.z, nbt.data)
        }
    }

    static loadRuntimePalette(stream) {
        const paletteSize = stream.readZigZagVarInt()
        const palette = []

        for (let i = 0; i < paletteSize; i++) {
            palette[i] = stream.readZigZagVarInt()
        }

        return palette
    }
}