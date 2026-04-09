import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockEntity extends BedrockObjectStorage {
    #attributes
    #info

    constructor(metadata, rawData, attributes = []) {
        const data = {
            raw: rawData,
            decoded: {
                decodeChunk: undefined,
            }
        }

        super({
            metadata,
            data
        }, { safeTypes: false })

        this.#attributes = new Map(attributes)
        this.#info = new Map()
    }

    get info() { return this.#info }

    #validAttributeName(name) {
        if (!name.startsWith('minecraft:')) name = `minecraft:${name}`
        return name
    }

    get attributes() {
        return this.#attributes.keys()
    }

    getAttribute(name) {
        return this.#attributes.get(this.#validAttributeName(name)).value
    }

    setAttribute(name, value) {
        const attribute = this.getAttribute(name)
        if (attribute.min > value) value = attribute.min
        if (attribute.max < value) value = attribute.max

        this.#attributes.set(this.#validAttributeName(name), value)
    }
}