export class BedrockAttributes {
    #attributes

    constructor(entity, attributes = []) {
        this.#attributes = new Map(attributes)
        entity.attributes = this
    }

    #validAttributeName(name) {
        if (!name.startsWith('minecraft:')) name = `minecraft:${name}`
        return name
    }

    get list() {
        return this.#attributes.keys()
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

        this.#attributes.set(this.#validAttributeName(name), value)
    }

    add(name, attributeData) {
        this.#attributes.set(this.#validAttributeName(name), attributeData)
    }
}