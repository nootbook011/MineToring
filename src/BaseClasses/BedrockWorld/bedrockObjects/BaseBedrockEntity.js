import { safeUpdate } from "#extra/extraFunctions"
import { BedrockPhysicsManager } from "#Storage/BaseBedrockPhysicsManager";
import { EventEmitter } from 'node:events';
import { BedrockPlugins } from "#Storage/BedrockPlugins";

// TODO: Add EventEmitter

export class BedrockEntity extends BedrockPlugins {
    #physics
    #metadata
    #info

    constructor(metadata, info = {}, physicsManager = undefined) {
        super()
        this.#metadata = metadata
        this.#info = info

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
        Object.assign(this.#info, infoInput)
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

}