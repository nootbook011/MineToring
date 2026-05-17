/*
 * thanks prismarine-chunk library for code reference 
*/

const wordByteSize = 4
const wordBitSize = wordByteSize * 8
const storageSize = 4096 // 4096 -> total # of entities (e.g. blocks) in storage, 16^3

class BetterUint32Array extends Uint32Array {
  toJSON () {
    return Array.from(this)
  }

  [Symbol.for('nodejs.util.inspect.custom')] () {
    return `[Uint32Array of ${this.length} items { ${this.slice(0, 10).toString()} ${this.length > 10 ? ', ...' : ''} }]`
  }
}

export class BedrockPalettedStorage {
  constructor (bitsPerBlock) {
    this.bitsPerBlock = bitsPerBlock
    this.blocksPerWord = Math.floor(wordBitSize / bitsPerBlock)
    this.wordsCount = Math.ceil(storageSize / this.blocksPerWord)
    this.mask = ((1 << bitsPerBlock) - 1)
    this.array = new BetterUint32Array(this.wordsCount)
  }

  read (stream) {
    const buf = stream.readBuffer(this.wordsCount * wordByteSize)
    this.array = new BetterUint32Array(new Uint8Array(buf).buffer)
  }

  write (stream) {
    stream.writeBuffer(Buffer.from(this.array.buffer))
  }

  static copyFrom (other) {
    const next = new BedrockPalettedStorage(other.bitsPerBlock)
    Object.assign(next, other)
    if (other instanceof Uint32Array) {
      next.array = new BetterUint32Array(other.array.slice())
    } else {
      next.array = new BetterUint32Array(other.array)
    }
    return next
  }

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

  getBuffer () {
    return Buffer.from(this.array.buffer)
  }

  readBits (index, offset) {
    return (this.array[index] >> offset) & this.mask
  }

  writeBits (index, offset, data) {
    this.array[index] &= ~(this.mask << offset)
    this.array[index] |= (data & this.mask) << offset
  }

  getIndex (x, y, z) {
    x &= 0xf
    y &= 0xf
    z &= 0xf
    const index = Math.floor(((x << 8) | (z << 4) | y) / this.blocksPerWord)
    const offset = (((x << 8) | (z << 4) | y) % this.blocksPerWord) * this.bitsPerBlock
    return [index, offset]
  }

  get (x, y, z) {
    const [index, offset] = this.getIndex(x, y, z)
    return this.readBits(index, offset)
  }

  set (x, y, z, data) {
    const [index, offset] = this.getIndex(x, y, z)
    this.writeBits(index, offset, data)
  }

  resize (newBitsPerBlock) {
    const storage = new BedrockPalettedStorage(newBitsPerBlock)
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        for (let z = 0; z < 16; z++) {
          storage.set(x, y, z, this.get(x, y, z))
        }
      }
    }
    return storage
  }

  forEach (callback) {
    for (let i = 0; i < storageSize; i++) {
      const index = Math.floor(i / this.blocksPerWord)
      const offset = (i % this.blocksPerWord) * this.bitsPerBlock
      callback(this.readBits(index, offset))
    }
  }

  incrementPalette (palette) {
    for (let i = 0; i < storageSize; i++) {
      const index = Math.floor(i / this.blocksPerWord)
      const offset = (i % this.blocksPerWord) * this.bitsPerBlock
      const ix = this.readBits(index, offset)
      palette[ix].count++
    }
  }
}