import { ChunkToV3, isV3, V3 } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockSubChunk extends BedrockObjectStorage {
    #position = V3(0, 0, 0)
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

    #blocks = []
    #palette = []
    #blockEntities = new Map()

    get hasPayload() {
        return this.#blocks.length >= 1
    }
    get blocks() { return this.#blocks }
    get palette() { return this.#palette }

    /**
     * It does nothing if SubChunk has not been initialized inside the dimension class.
     * If it does, it decodes new payload of data using a special function that is automatically adjusted to a specific version.
     */
    setPayload(payload) { }

    getLayer(layer) {
        this.#blocks[layer] ??= []
        this.#palette[layer] ??= []

        return {
            blocks: this.#blocks[layer],
            palette: this.#palette[layer]
        }
    }
    setLayer(layer, blocks, palette) {
        const l = this.getLayer(layer)
        Object.assign(l, { blocks, palette })
    }

    getBlockEntity(x, y, z) {
        const index = `${x}${y}${z}`
        return this.#blockEntities.get(index)
    }
    setBlockEntity(x, y, z, data) {
        const index = `${x}${y}${z}`
        this.#blockEntities.set(index, data)
    }

    getBlockId(x, y, z, l) {
        const { blocks, palette } = this.getLayer(l)
        if (!blocks?.array?.length > 0 || !palette?.length > 0) return false
        const id = blocks.get(x, y, z)

        return palette[id]
    }
    setBlockId(x, y, z, l, id) {
        const { blocks, palette } = this.getLayer(l)
        if (!blocks?.array?.length > 0 || !palette?.length > 0) return false
        blocks.set(x, y, z, id)
    }
}