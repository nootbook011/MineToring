export class BedrockThread {
    #Thread = []
    #Cursor = 0
    
    next() {
        if (this.#Cursor >= this.#Thread.length) {
            this.clear()
            return undefined
        }
        const value = this.#Thread[this.#Cursor]
        this.#Thread[this.#Cursor] = undefined
        this.#Cursor++

        return value
    }

    add(value) {
        this.#Thread.push(value)
    }

    get length() {
        return this.#Thread.length - this.#Cursor
    }

    clear() {
        this.#Thread = []
        this.#Cursor = 0
    }
}