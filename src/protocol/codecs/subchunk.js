import { V3WorldToLocal } from "#extra/extraWorldFunctions"
import { parsePayload } from "./index.js"
import * as pNbt from "prismarine-nbt"

export class SubChunkCodec {
    static decode(payload, BSubChunk) {
        const stream = parsePayload(payload)
        if (!stream) return false

        const version = stream.readByte()
        switch(version) {
            case 9: return SubChunkCodec.decodeV9(stream, BSubChunk)
            default: return false
        }
    }

    static decodeV9(stream, BSubChunk) {
        const layersCount = stream.readByte()
        const subChunkY = (stream.readByte() << 24) >> 24
        if (subChunkY !== BSubChunk.position.y) {
            console.warn(`Mismatch of Y coordinat between payload and packet: ${BSubChunk.position.y} packet, ${subChunkY} payload. \nAutomatically trust payload data.`)
            BSubChunk.position.y = subChunkY
        }

        for (let l = 0; l < layersCount; l++) {
            const paletteType = stream.readByte()
            const isRuntimeIds = (paletteType & 1) === 1
            if (!isRuntimeIds) throw new Error('This method decode only network data.')

            const storage = BSubChunk.createLayer(l)
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
}
export class SubChunkBlocksEntityCodec {
    static decode(payload, BSubChunk) {
        const stream = parsePayload(payload)
        if (!stream) return false

        let startOffset = stream.readOffset
        while (stream.peek() === 0x0A) {
            const nbt = pNbt.protos.littleVarint.parsePacketBuffer('nbt', stream.buffer, startOffset)
            stream.readOffset += nbt.metadata.size
            startOffset += nbt.metadata.size
            const simply = pNbt.simplify(nbt.data)
            const { x, y, z } = simply
            const local = V3WorldToLocal(x, y, z)

            BSubChunk.setBlockEntity(local.x, local.y, local.z, nbt.data)
        }

        return true
    }
}