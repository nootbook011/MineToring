import { ChunkToV3, getIndexV3, isV3, V3 } from "#extra/extraWorldFunctions";
import { BedrockProtocol, ProtocolLoader } from "#Main/Packets/ProtocolLoader";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";
import { BedrockPalettedStorage } from "#Storage/BedrockPalletedStorage";

/**
 * @extends {BedrockObjectStorage<{dimension: number, cache: boolean, hash: bigint}>}
 */
export class BedrockSubChunk extends BedrockObjectStorage {
    #position = V3(0, 0, 0)

    get #parser() { return this.protocol.parsers.Subchunk }

    /**
     * @type {Array<import('#Storage/BedrockPalletedStorage').BedrockPalettedStorage>}
     */
    #blocks = [new BedrockPalettedStorage(1)]
    /**
     * @type {Array<Array<number>>}
     */
    #palette = [[]]
    /** @type {Map<number, object>} */
    #blockEntities = new Map()

    constructor (metadata = undefined) {
        super({
            dimension: 0,
            cache: false,
            hash: 0n,
        })
        if (metadata) this.setMetadata(metadata)
    }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }
    get from() { return ChunkToV3(this.position) }
    get to() {
        const to = this.from
        return V3(
            to.x + 15,
            to.y + 15,
            to.z + 15
        )
    }

    get hasBlocks() { return this.#palette[0]?.length > 0 }
    get blocks() { return this.#blocks }
    get palette() { return this.#palette }

    /**
     * decodes new payload of data using a special function that is automatically adjusted to a specific version.
     */
    setPayload(payload) {
        const decoder = this.protocol.decoders.SubChunkDecoder
        if (!decoder) throw new Error(`Cannot load SubChunkDecoder`)
        
        if (payload?.length > 1) decoder.decodeNetwork(this, payload, this.metadata.cache)
        else return false
    }

    getLayer(layer) {
        this.#blocks[layer] ??= new BedrockPalettedStorage(1)
        this.#palette[layer] ??= []

        return {
            blocks: this.#blocks[layer],
            palette: this.#palette[layer]
        }
    }

    getBlockEntity(x, y, z) {
        return this.#blockEntities.get(getIndexV3(x, y, z))
    }
    setBlockEntity(x, y, z, data) {
        this.#blockEntities.set(getIndexV3(x, y, z), data)
    }

    getBlockId(x, y, z, l) {
        const { blocks, palette } = this.getLayer(l)
        const id = blocks.get(x, y, z)

        return palette[id]
    }
    setBlockId(x, y, z, l, id) {
        const { blocks, palette } = this.getLayer(l)

        const index = palette.indexOf(id)
        if (index !== -1) {
            blocks.set(x, y, z, index)
        } else {
            palette.push(id)
            const paletteIndex = palette.length - 1
            const minBits = 32 - Math.clz32(paletteIndex)
            if (minBits > blocks.bitsPerBlock) {
                this.#blocks[l] = blocks.resize(minBits)
            }

            blocks.set(x, y, z, paletteIndex)
        }
    }
}