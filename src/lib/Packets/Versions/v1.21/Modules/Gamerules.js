export class BedrockGamerules {
    name = 'gamerules'
    #gamerules = new Map()
    #world

    injector(world) {
        world.gamerules = this
    }

    constructor(world, gamerules = undefined) {
        this.#world = world
        if (gamerules) this.update(gamerules, false)
    }

    update(gamerules, emit = true) {
        const world = this.#world
        const old = this.object

        for (const gamerule of gamerules ?? []) {
            const { name, ...data } = gamerule
            this.#gamerules.set(name, data)
        }
        
        if (emit) world.events.emit('gamerules', this.object, old)
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
}