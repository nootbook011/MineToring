export class BedrockAttributes {
    name = 'attributes'
    #attributes = new Map()

    injector(entity) {
        entity.attributes = this
        Object.defineProperties(entity, {
            health: {
                get: () => this.get('health'),
                set: (v) => this.set('health', v),
                enumerable: true
            },
            food: {
                get: () => this.get('hunger'),
                set: (v) => this.set('hunger', v),
                enumerable: true
            },
            xp: {
                get: () => this.get('level'),
                set: (v) => this.set('level', v),
                enumerable: true
            }
        })
    }

    #validAttributeName(name) {
        const i = name.lastIndexOf('.')
        name = i === -1 ? name : name.slice(i + 1)
        if (!name.startsWith('minecraft:')) name = `minecraft:${name}`
        return name
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
        const attribute = this.#attributes.get(this.#validAttributeName(name))
        if (!attribute) return false

        if (attribute?.min > value) value = attribute.min
        if (attribute?.max < value) value = attribute.max

        return this.#attributes.set(this.#validAttributeName(name), { ...attribute, value })
    }

    add(name, attributeData) {
        this.#attributes.set(this.#validAttributeName(name), attributeData)
    }

}