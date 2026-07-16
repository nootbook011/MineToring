/*
 * thanks prismarine-chunk library for code reference 
*/

const wordByteSize = 4
const wordBitSize = 32
const storageSize = 4096

export class PalettedStorage {
    #palette = []
    #storage

    bitsPerBlock
    blocksPerWord
    wordsCount
    mask
    byteLength

    get palette() { return this.#palette }
    set palette(array) {
        if (!Array.isArray(array)) throw new TypeError('Palette is Array only!')
        this.#palette = array
    }
    get storage() { return this.#storage }
    set storage(array) {
        if (!Array.isArray(array) && !(array instanceof Uint32Array)) {
            throw new TypeError('Storage must be an Array or Uint32Array!')
        }
        if (array instanceof Uint32Array) this.#storage = array
        else this.#storage = new Uint32Array(array)
    }

    get isEmpty() { return !this.palette.length }

    static copyFrom(other) {
        const next = new PalettedStorage(other.storage.slice(), [...other.palette])
        next.bitsPerBlock = other.bitsPerBlock
        next.blocksPerWord = other.blocksPerWord
        next.wordsCount = other.wordsCount
        next.mask = other.mask
        next.byteLength = other.byteLength
        return next
    }

    constructor(storage = undefined, palette = undefined) {
        if (palette) this.palette = palette
        if (storage) this.storage = storage
    }

    create(bitsPerBlock = 2) {
        this.#initStorage(bitsPerBlock)
        return this
    }

    #initStorage(bitsPerBlock) {
        this.bitsPerBlock = bitsPerBlock
        this.blocksPerWord = Math.floor(wordBitSize / bitsPerBlock)
        this.wordsCount = Math.ceil(storageSize / this.blocksPerWord)
        this.mask = bitsPerBlock === 32 ? 0xffffffff : (1 << bitsPerBlock) - 1
        this.byteLength = this.wordsCount * wordByteSize

        this.#storage = new Uint32Array(this.wordsCount)
    }

    readBits(index, offset) {
        return (this.#storage[index] >> offset) & this.mask
    }
    writeBits(index, offset, data) {
        const mask = this.mask
        const word = this.#storage[index]
        const shiftedMask = mask << offset

        this.#storage[index] = (word & ~shiftedMask) | ((data << offset) & shiftedMask)
    }
    initBits(index, offset, data) {
        this.#storage[index] |= (data << offset) & (this.mask << offset)
    }

    getBitIndex(x, y, z) {
        x &= 0xf; y &= 0xf; z &= 0xf
        const iv = (x << 8) | (z << 4) | y

        const index = Math.floor(iv / this.blocksPerWord)
        const offset = (iv % this.blocksPerWord) * this.bitsPerBlock
        
        return (index << 5) | offset
    }
    getPaletteIndex(x, y, z) {
        const packed = this.getBitIndex(x, y, z)
        return this.readBits(packed >> 5, packed & 0x1f)
    }
    setPaletteIndex(x, y, z, i) {
        const packed = this.getBitIndex(x, y, z)
        return this.writeBits(packed >> 5, packed & 0x1f, i)
    }

    get(x, y, z) {
        const paletteIndex = this.getPaletteIndex(x, y, z)
        return this.palette[paletteIndex]
    }
    set(x, y, z, id) {
        let index = this.palette.indexOf(id)

        if (index === -1) {
            this.palette.push(id)
            index = this.palette.length - 1

            if (index > this.mask) this.#resizeStorage(32 - Math.clz32(index))
        }

        this.setPaletteIndex(x, y, z, index)
    }

    forEach(callback) {
        for (let i = 0; i < storageSize; i++) {
            const index = Math.floor(i / this.blocksPerWord)
            const offset = (i % this.blocksPerWord) * this.bitsPerBlock

            callback(index, offset, i)
        }
    }
    #resizeStorage(newBitsPerBlock) {
        const old = new Uint32Array(storageSize)

        for (let i = 0; i < storageSize; i++) {
            const index = Math.floor(i / this.blocksPerWord)
            const offset = (i % this.blocksPerWord) * this.bitsPerBlock

            old[i] = this.readBits(index, offset)
        }

        this.#initStorage(newBitsPerBlock)

        for (let i = 0; i < storageSize; i++) {
            const index = Math.floor(i / this.blocksPerWord)
            const offset = (i % this.blocksPerWord) * this.bitsPerBlock

            this.initBits(index, offset, old[i])
        }
    }

    read(stream) {
        const buf = stream.readBuffer(this.byteLength)
        this.#storage = new Uint32Array(new Uint8Array(buf).buffer)
    }
    write(stream) { stream.writeBuffer(Buffer.from(this.#storage.buffer)) }
}

export class ProxyPalettedStorage {
    #root
    get root() { return this.#root }

    constructor (palettedStorage) {
        if (palettedStorage instanceof PalettedStorage) this.#root = palettedStorage
        else throw new TypeError(`Can create Proxy only on PalettedStorage class, received ${typeof palettedStorage}`)
    }
    
    create() {
        return PalettedStorage.copyFrom(this.#root)
    }
}