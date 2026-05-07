import { V3 } from "#extra/extraWorldFunctions";
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockSubChunk extends BedrockObjectStorage {
    pos = V3(0, 0, 0)
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

    hasBlockId(id) {
        const { palette } = this.getLayer(0)
        return palette.includes(id)
    }

    getBlockId(x, y, z, l) {
        const { blocks, palette } = this.getLayer(l)
        const id = blocks.get(x, y, z)

        return palette[id]
    }

    setBlockId(x, y, z, l, id) {
        const { blocks, palette } = this.getLayer(l)
        blocks.set(x, y, z, id)
    }
}