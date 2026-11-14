export class BedrockThread {
    #thread = []
    #cursor = 0

    get length() { return this.#thread.length - this.#cursor }

    next() {
        if (this.#cursor >= this.#thread.length) {
            this.clear()
            return undefined
        }
        const value = this.#thread[this.#cursor]
        this.#thread[this.#cursor] = undefined
        this.#cursor++

        return value
    }
    push(value) { this.#thread.push(value) }
    clear() {
        this.#thread = []
        this.#cursor = 0
    }

    *[Symbol.iterator]() {
        let value
        while ((value = this.next()) !== undefined) yield value
    }
}