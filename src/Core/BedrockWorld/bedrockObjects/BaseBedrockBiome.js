import { V3, isV3 } from "#extra/extraWorldFunctions"
import { BedrockPalettedStorage } from "#Storage/BedrockPalletedStorage"

export class BedrockBiomeSection {
    #position = V3(0, 0, 0)
    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }

    /**
     * @type {Array<number>}
     */
    palette = []
    /**
     * @type {import('#Storage/BedrockPalletedStorage').BedrockPalettedStorage}
     */
    biomes = new BedrockPalettedStorage(1)

    setBiomeId(x, y, z, id) {
        const { palette, biomes } = this

        const index = palette.indexOf(id)
        if (index !== -1) {
            biomes.set(x, y, z, index)
        } else {
            palette.push(id)
            const paletteIndex = palette.length - 1
            const minBits = 32 - Math.clz32(paletteIndex)
            if (minBits > biomes.bitsPerBlock) {
                this.biomes = biomes.resize(minBits)
            }

            biomes.set(x, y, z, paletteIndex)
        }
    }

    getBiomeId(x, y, z) {
        return this.palette[this.biomes.get(x, y, z)]
    }
}