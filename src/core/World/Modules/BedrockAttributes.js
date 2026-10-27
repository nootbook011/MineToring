function parseAttributeName(name) {
    if (name.startsWith('minecraft:')) name = name.slice(10)
    const i = name.lastIndexOf('.')
    name = i === -1 ? name : name.slice(i + 1)
    return name
}

export class BedrockAttributes {
    static name = 'attributes'
    /** @type {{string: {min: number, max: number, value: number, modifiers: Array }}} */
    attributes = {}
    #entity

    injector(entity) {
        entity.attributes = this
        Object.defineProperties(entity, {
            health: {
                get: () => this.getValue('health'),
                set: (v) => this.setValue('health', v),
                enumerable: true
            },
            food: {
                get: () => this.getValue('hunger'),
                set: (v) => this.setValue('hunger', v),
                enumerable: true
            },
            xp: {
                get: () => this.getValue('level'),
                set: (v) => this.setValue('level', v),
                enumerable: true
            }
        })
    }

    constructor(entity) {
        this.#entity = entity
    }

    /**
     * 
     * @param {[{name: string}]} attributes 
     */
    update(attributes) {
        const entity = this.#entity
        const old = this.object

        for (const attribute of attributes ?? []) {
            this.setAttribute(attribute)
        }

        entity.events.emit(`updateAttributes`, this.object, old)
    }

    /**
    * Returns an object with the attribute names as keys and their values as values, it will remove the "minecraft:" prefix from the keys.
    */
    get object() {
        const obj = {}
        for (const key in this.attributes) {
            obj[key] = this.getValue(key)
        }
        return obj
    }

    hasModifier(attributeName, modifierId) {
        const attribute = this.getAttribute(attributeName)
        for (const modifier of attribute.modifiers) {
            if (modifier.id == modifierId) return true
        }
        return false
    }

    getAttribute(name) {
        return this.attributes[parseAttributeName(name)]
    }
    setAttribute(attribute) {
        const entity = this.#entity
        const { name, min = -Infinity, max = Infinity, current, value, default: def, modifiers = [] } = attribute || {}
        const parseName = parseAttributeName(name)
        const old = this.getValue(parseName)

        this.attributes[parseName] = {
            name,
            min,
            max,
            value: current ?? value,
            default: def,
            modifiers
        }
        entity.events.emit(`${parseName}Change`, value ?? current, old)
    }

    getValue(name) {
        return this.attributes[parseAttributeName(name)]?.value
    }
    setValue(name, value) {
        const parseName = parseAttributeName(name)
        const attribute = this.attributes[parseName]
        const entity = this.#entity
        if (!attribute) return false

        if (attribute.min > value) value = attribute.min
        if (attribute.max < value) value = attribute.max
        attribute.value = value
        entity.events.emit(`${parseName}Change`, value, attribute.value)

        return this.attributes
    }
}