export class BedrockGamerules {
    name = 'gamerules'
    #gamerules = new Map()

    injector(world) {
        world.gamerules = this
    }

    get map() { return this.#gamerules }

    get object() {
        const obj = {}
        for (const [key, gamerule] of this.#gamerules) {
            obj[key] = gamerule.value
        }
        return obj
    }

    get(name) {
        return this.#gamerules.get(name)?.value
    }
    set(name, value) {
        const data = this.#gamerules.get(name)
        if (!data) return false
        
        if (data.editable) throw new TypeError('Gamerule cannot be edit')
        return this.#gamerules.set(name, { ...data, value })
    }
    add(name, gameruleData) {
        this.#gamerules.set(name, gameruleData)
    }
}