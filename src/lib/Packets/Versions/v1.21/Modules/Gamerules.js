export class BedrockGamerules {
    #gamerules = new Map()
    #proxy

    constructor(world, gamerules = undefined) {
        this.#proxy = new Proxy(this.#gamerules, {
            get: (target, name) => {
                if (name === Symbol.toPrimitive || name === 'toJSON' || name === 'object') {
                    return this.object
                }
                
                if (name in target && typeof target[name] === 'function') {
                    return target[name].bind(target)
                }

                if (typeof name === 'string') {
                    return this.get(name)
                }

                return Reflect.get(target, name)
            },
            set: (target, name, value) => {
                return this.set(name, value)
            }
        })

        world.gamerules = this.#proxy

        if (gamerules) this.buildFromPacket(gamerules)
    }

    get object() {
        const obj = {}
        for (const [key, gamerule] of this.#gamerules) {
            obj[key] = gamerule.value
        }
        return obj
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
        if (data.editable) throw new TypeError('Gamerule cannot be edit')
        return this.#gamerules.set(name, { ...data, value })
    }
}