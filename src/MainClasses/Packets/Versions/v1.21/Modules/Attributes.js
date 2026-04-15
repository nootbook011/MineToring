export class BedrockAttributes {
    #attributes

    constructor(entity, attributes = []) {
        this.#attributes = new Map(attributes)
        const self = this
        Object.defineProperty(entity, 'attributes', {
            get: function () {
                return self
            }
        })
    }

    #validAttributeName(name) {
        if (!name.startsWith('minecraft:')) name = `minecraft:${name}`
        return name
    }

    get list() {
        return this.#attributes.keys()
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