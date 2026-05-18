import { V3, isV3 } from "#extra/extraWorldFunctions"
import { BedrockPalettedStorage } from "#Storage/Binary/BedrockPalletedStorage"
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage"

/**
 * @extends {BedrockObjectStorage<{dimension: number}>}
 */
export class BedrockBiomeSection extends BedrockObjectStorage {
    #position = V3(0, 0, 0)
    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }

    constructor (metadata = undefined, protocol = undefined, registry = undefined) {
        super({
            dimension: 0,
        }, protocol, registry)
        if (metadata) this.setMetadata(metadata)
    }

    /**
     * @type {Array<number>}
     */
    palette = []
    /**
     * @type {import('#Base/BedrockStorage/Binary/BedrockPalletedStorage').BedrockPalettedStorage}
     */
    biomes = new BedrockPalettedStorage(1)

    get hasBiomes() { return this.palette?.length > 0 }

    getBiomeData(x, y, z) {
        const id = this.getBiomeId(x, y, z)
        return this.registry.biomes[id]
    }

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

export class BedrockProxyBiomeSection {
    /** @type {BedrockBiomeSection} */
    #root
    get originSection() { return this.#root }
    constructor (BiomeSection) {
        if (BiomeSection instanceof BedrockBiomeSection) this.#root = BiomeSection
        else throw new TypeError(`Can create Proxy only on BiomeSection class, received ${typeof BiomeSection}`)
    }

    create(y) {
        const BiomeSection = new BedrockBiomeSection(undefined, this.#root.protocol, this.#root.registry)

        BiomeSection.position = { ...this.#root.position, y }
        BiomeSection.biomes = BedrockPalettedStorage.copyFrom(this.#root.biomes)
        BiomeSection.palette = [...this.#root.palette]

        return BiomeSection
    }
}