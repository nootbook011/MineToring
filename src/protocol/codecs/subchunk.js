import { ByteStream } from "#Core/Storage/Binary/ByteStream"
import { parsePayload } from "./index.js"
import { NBTCodec } from "./nbt.js"

export class SubChunkCodec {
    static decode(payload, BSubChunk) {
        const stream = parsePayload(payload)
        if (!stream) return false

        const version = stream.readByte()
        switch (version) {
            case 9: return SubChunkCodec.decodeV9(stream, BSubChunk)
            default: return false
        }
    }
    static encode(version, BSubChunk) {
        const stream = new ByteStream()
        stream.writeUInt8(version)

        switch (version) {
            case 9: return SubChunkCodec.encodeV9(stream, BSubChunk)
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

    static encodeV9(stream, BSubChunk) {
        const blocks = BSubChunk.blocks
        stream.writeUInt8(blocks.length)
        stream.writeUInt8(BSubChunk.position.y)

        for (let l = 0; l < BSubChunk.blocks.length; l++) {
            const storage = blocks[l]
            let paletteType = (storage.bitsPerBlock << 1) | 1 // Runtime
            stream.writeUInt8(paletteType)
            storage.write(stream)

            stream.writeZigZagVarInt(storage.palette.length)
            for (const block of storage.palette) {
                stream.writeZigZagVarInt(block)
            }
        }

        return stream.getBuffer()
    }
}
export class SubChunkBlocksEntityCodec {
    static decode(payload, BSubChunk) {
        const stream = parsePayload(payload)
        if (!stream) return false

        while (stream.peek() === 0x0A) {
            const nbt = NBTCodec.decode(stream)
            const x = nbt.value.x.value; const y = nbt.value.y.value; const z = nbt.value.z.value

            BSubChunk.setBlockEntity(x & 15, y & 15, z & 15, nbt)
        }

        return true
    }
}