import { V3, isV3 } from "#extra/extraWorldFunctions"
import { BedrockPalettedStorage } from "#Storage/Binary/BedrockPalletedStorage"
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage"

export class BedrockBiomeSection extends BedrockObjectStorage {
    #position = V3(0, 0, 0)
    dimension = 0

    constructor (protocol = undefined, registry = undefined) {
        super(protocol, registry)
    }

    get position() { return this.#position }
    set position(v3) {
        if (isV3(v3)) return this.#position = v3
        else return false
    }

    create(x, y, z, dimension) {
        this.dimension = dimension
        this.position = V3(x, y, z)
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
        const { x, z } = this.#root.position
        const BiomeSection = new BedrockBiomeSection(this.#root.protocol, this.#root.registry)
        BiomeSection.create(x, y, z, this.#root.dimension)

        BiomeSection.biomes = BedrockPalettedStorage.copyFrom(this.#root.biomes)
        BiomeSection.palette = [...this.#root.palette]

        return BiomeSection
    }
}