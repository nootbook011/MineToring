import { ByteStream } from "#Core/Storage/Binary/ByteStream"
import { PalettedStorage, ProxyPalettedStorage } from "#Core/Storage/Binary/PalettedStorage"
import { DIMENSIONS_DATA as dimData } from "#Core/Storage/constants"
import { parsePayload } from "./index.js"

export class ChunkBiomesCodec {
    static decode(payload, BChunk) {
        const stream = parsePayload(payload)
        if (!stream) return false
        const { maxCY, minCY } = dimData[BChunk.dimension]
        let proxy

        for (let y = minCY; stream.peek() && y <= maxCY; y++) {
            if (stream.peek() === 0xff) {
                if (!proxy) throw new Error(`Cannot use last section.`)
                BChunk.setBiomeSection(y, proxy)
                stream.readByte()
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
                const paletteSize = stream.readVarInt() >> 1

                for (let i = 0; i < paletteSize; i++) {
                    storage.palette[i] = stream.readVarInt() >> 1
                }
            }

            BChunk.setBiomeSection(y, storage)

            if (stream.peek() === 0xff) proxy = new ProxyPalettedStorage(storage)
        }

        return true
    }

    static encode(BChunk) {
        const stream = new ByteStream()
        const { minCY } = dimData[BChunk.dimension]

        for (let y = minCY; BChunk.biomes[y]; y++) {
            const biome = BChunk.biomes[y]
            if (biome instanceof ProxyPalettedStorage) {
                stream.writeUInt8(0xFF)
                continue
            }

            const bitsPerBlock = biome.bitsPerBlock
            const paletteType = (bitsPerBlock << 1) | 1 // Runtime
            stream.writeUInt8(paletteType)
            if (bitsPerBlock === 0) {
                stream.writeVarInt(this.palette[0] << 1)
                return
            }

            biome.write(stream)
            stream.writeVarInt(biome.palette.length << 1)
            for (const id of biome.palette) {
                stream.writeVarInt(id << 1)
            }
        }

        return stream.getBuffer()
    }
}
export class ChunkBorderBlocksCodec {
    static decode(payload, BChunk) {
        const stream = parsePayload(payload)
        if (!stream) return false

        const countByte = stream.readByte()
        const count = countByte == 0 ? 256 : countByte

        for (let i = 0; i < count; i++) {
            if (stream.peek() === undefined) break

            const packedXZ = stream.readByte()
            const z = packedXZ >> 4
            const x = packedXZ & 0x0F

            BChunk.setBorder(x, z, true)
        }

        return true
    }
}