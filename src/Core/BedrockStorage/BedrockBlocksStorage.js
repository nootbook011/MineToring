import PalettedStorage from "prismarine-chunk/src/bedrock/common/PalettedStorage.js";

export class BedrockBlocksStorage extends PalettedStorage {
    getDecodedArray() {
        const { array, mask, blocksPerWord, bitsPerBlock } = this
        const result = new Int32Array(4096 * 4)

        for (let i = 0; i < 4096; i++) {
            const y = i & 0xf
            const z = (i >> 4) & 0xf
            const x = (i >> 8) & 0xf

            const wordIndex = Math.floor(i / blocksPerWord)
            const offset = (i % blocksPerWord) * bitsPerBlock
            const paletteIndex = (array[wordIndex] >> offset) & mask

            const resIdx = i << 2
            result[resIdx] = x
            result[resIdx + 1] = y
            result[resIdx + 2] = z
            result[resIdx + 3] = paletteIndex
        }
        return result
    }
}