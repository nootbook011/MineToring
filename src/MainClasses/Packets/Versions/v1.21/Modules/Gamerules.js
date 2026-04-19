export class GameruleError extends Error { }

export class BedrockGamerules {
    #gamerules = new Map()

    constructor(gamerules) {
        this.buildFromPacket(gamerules)
    }

    buildFromPacket(gamerules) {
        for (const gamerule of gamerules) {
            const { name, ...data } = gamerule
            this.#gamerules.set(name, data)
        }
    }

    get(name) {
        return this.#gamerules.get(name)?.value
    }
    set(name, value) {
        const data = this.#gamerules.get(name)
        if (!data) return false
        if (data.editable) throw new GameruleError('Gamerule cannot be edit')
        return this.#gamerules.set(name, { ...data, value })
    }
}