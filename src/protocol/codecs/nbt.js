import { ByteStream } from "#Core/Storage/Binary/ByteStream"
import { toBigInt } from "#extra/extraFunctions"
import { parsePayload } from "./index.js"

const TAG = {
    END: 0, BYTE: 1, SHORT: 2, INT: 3, LONG: 4, FLOAT: 5, DOUBLE: 6,
    BYTE_ARRAY: 7, STRING: 8, LIST: 9, COMPOUND: 10, INT_ARRAY: 11, LONG_ARRAY: 12
}
const TAG_NAMES = {
    0: 'end', 1: 'byte', 2: 'short', 3: 'int', 4: 'long', 5: 'float', 6: 'double',
    7: 'byteArray', 8: 'string', 9: 'list', 10: 'compound', 11: 'intArray', 12: 'longArray'
}
const TAG_IDS = Object.fromEntries(Object.entries(TAG_NAMES).map(([k, v]) => [v, Number(k)]))

export class NBTCodec {
    static decode(buffer) {
        const stream = parsePayload(buffer)
        if (!stream) return false

        const root = this.#readTag(stream)
        if (!root) throw new Error('Empty NBT (TAG_End at root)')
        return root
    }
    static encode(object) {
        const stream = new ByteStream()
        this.#writeTag(
            stream,
            object,
            true
        )
        return stream.getBuffer()
    }

    // read
    static #readTag(stream) {
        if (stream.peek() === undefined) return null
        const typeId = stream.readUInt8()
        if (typeId === TAG.END) return null
        const name = this.#readString(stream)
        const value = this.#readPayload(stream, typeId)
        return { type: TAG_NAMES[typeId], name, value }
    }
    static #readString(stream) {
        const len = stream.readVarInt()
        if (len === 0) return ''
        return stream.readBuffer(len).toString('utf8')
    }
    static #readPayload(stream, typeId) {
        switch (typeId) {
            case TAG.BYTE: return stream.readInt8()
            case TAG.SHORT: return stream.readInt16LE()
            case TAG.INT: return stream.readZigZagVarInt()
            case TAG.LONG: return stream.readZigZagVarLong()
            case TAG.FLOAT: return stream.readFloatLE()
            case TAG.DOUBLE: return stream.readDoubleLE()
            case TAG.STRING: return this.#readString(stream)

            case TAG.BYTE_ARRAY: {
                const len = stream.readZigZagVarInt()
                return stream.readBuffer(len)
            }
            case TAG.LIST: {
                const elemTypeId = stream.readUInt8()
                const len = stream.readZigZagVarInt()
                const value = new Array(len)
                for (let i = 0; i < len; i++) value[i] = this.#readPayload(stream, elemTypeId)
                return { type: TAG_NAMES[elemTypeId], value }
            }
            case TAG.COMPOUND: {
                const value = {}
                while (true) {
                    const tag = this.#readTag(stream)
                    if (!tag) break
                    value[tag.name] = { type: tag.type, value: tag.value }
                }
                return value
            }
            case TAG.INT_ARRAY: {
                const len = stream.readZigZagVarInt()
                const value = new Array(len)
                for (let i = 0; i < len; i++) value[i] = stream.readInt32LE()
                return value
            }
            case TAG.LONG_ARRAY: {
                const len = stream.readZigZagVarInt()
                const value = new Array(len)
                for (let i = 0; i < len; i++) value[i] = stream.readInt64LE()
                return value
            }

            default:
                throw new Error(`Unknown NBT tag id: ${typeId}`)
        }
    }

    // write
    static #writeTag(stream, tag) {
        if (!tag) return stream.writeUInt8(TAG.END)
        const typeId = TAG_IDS[tag.type]
        if (typeId === undefined) throw new Error(`Unknown NBT type: ${tag.type}`)
        stream.writeUInt8(typeId)
        this.#writeString(stream, tag.name || '')
        this.#writePayload(stream, typeId, tag.value)
    }
    static #writeString(stream, str) {
        const buf = Buffer.from(str, 'utf8')
        stream.writeVarInt(buf.length)
        stream.writeBuffer(buf)
    }
    static #writePayload(stream, typeId, value) {
        switch (typeId) {
            case TAG.BYTE: return stream.writeInt8(Number(value))
            case TAG.SHORT: return stream.writeInt16LE(Number(value))
            case TAG.INT: return stream.writeZigZagVarInt(Number(value))
            case TAG.LONG: return stream.writeZigZagVarlong(toBigInt(value))
            case TAG.FLOAT: return stream.writeFloatLE(Number(value))
            case TAG.DOUBLE: return stream.writeDoubleLE(Number(value))
            case TAG.STRING: return this.#writeString(stream, String(value))

            case TAG.BYTE_ARRAY: {
                const buf = Buffer.from(value)
                stream.writeZigZagVarInt(buf.length)
                stream.writeBuffer(buf)
                break
            }
            case TAG.LIST: {
                const elemTypeId = TAG_IDS[value.type] ?? TAG.END
                stream.writeUInt8(elemTypeId)
                stream.writeZigZagVarInt(value.value.length)
                for (const elem of value.value) this.#writePayload(stream, elemTypeId, elem)
                break
            }
            case TAG.COMPOUND: {
                for (const key of Object.keys(value)) {
                    const child = value[key]
                    this.#writeTag(stream, { type: child.type, name: key, value: child.value }, false)
                }
                this.#writeTag(stream, null, false)
                break
            }
            case TAG.INT_ARRAY: {
                stream.writeZigZagVarInt(value.length)
                for (const v of value) stream.writeInt32LE(Number(v))
                break
            }
            case TAG.LONG_ARRAY: {
                stream.writeZigZagVarInt(value.length)
                for (const v of value) stream.writeInt64LE(toBigInt(v))
                break
            }

            default:
                throw new Error(`Unknown NBT type id: ${typeId}`)
        }
    }
}