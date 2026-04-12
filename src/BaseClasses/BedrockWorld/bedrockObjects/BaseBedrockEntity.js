import { safeUpdate } from "#extra/extraFunctions"
import { BedrockPhysicsManager } from "#Base/BedrockStorage/BaseBedrockPhysicsManager";

export class BedrockEntity {
    #physics
    #attributes
    #metadata
    #info

    constructor(metadata, info = {}, attributes = [], physicsManager = undefined) {
        this.#metadata = metadata
        this.#info = info
        this.#attributes = new Map(attributes)

        if (physicsManager instanceof BedrockPhysicsManager) this.#physics = physicsManager
        else this.#physics = new BedrockPhysicsManager()
    }

    get metadata() {
        return this.#metadata
    }
    setMetadata(metadataInput) {
        safeUpdate(this.#metadata, metadataInput, this.metadata)
    }

    get info() {
        return this.#info
    }
    setInfo(infoInput) {
        safeUpdate(this.#info, infoInput, this.info)
    }

    get physics() {
        return this.#physics
    }

    get position() {
        return this.#physics.position
    }

    get rotation() {
        return this.#physics.rotation
    }

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
        if (attribute?.min > value) value = attribute.min
        if (attribute?.max < value) value = attribute.max

        this.#attributes.set(this.#validAttributeName(name), value)
    }

    addAttribute(name, attributeData) {
        this.#attributes.set(this.#validAttributeName(name), attributeData)
    }
}