export class BedrockAttributes {
    #attributes
    #proxy

    constructor(entity, attributes = []) {
        this.#attributes = new Map(attributes)

        this.#proxy = new Proxy(this.#attributes, {
            get: (target, name) => {
                if (name === Symbol.toPrimitive || name === 'toJSON' || name === 'object') {
                    return () => this.object
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

        Object.defineProperty(entity,
            'attributes', {
                get: () => this.#proxy,
                enumerable: true,
                configurable: false
            })
    }

    #validAttributeName(name) {
        if (!name.startsWith('minecraft:')) name = `minecraft:${name}`
        const i = name.lastIndexOf('.')
        return i === -1 ? name : name.slice(i + 1)
    }
    
    /**
    * Returns an object with the attribute names as keys and their values as values, it will remove the "minecraft:" prefix from the keys.
    */
    get object() {
        const obj = {}
        for (const [key, attr] of this.#attributes) {
            obj[key.slice(10)] = attr.value
        }
        return obj
    }

    get(name) {
        return this.#attributes.get(this.#validAttributeName(name))?.value
    }

    set(name, value) {
        const attribute = this.get(name)
        if (attribute?.min > value) value = attribute.min
        if (attribute?.max < value) value = attribute.max

        return this.#attributes.set(this.#validAttributeName(name), value)
    }
}