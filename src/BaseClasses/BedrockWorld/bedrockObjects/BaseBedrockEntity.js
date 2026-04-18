import { recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from 'node:events'
import { BedrockPlugins } from "#Storage/BedrockPlugins"

export class BedrockEntity extends BedrockPlugins {
    #events = new EventEmitter()
    #metadata
    #states

    constructor(metadata, states = {}) {
        super()
        this.#metadata = metadata
        this.#states = states
    }

    get metadata() {
        return this.#metadata
    }
    setMetadata(metadataInput) {
        recurseUpdate(this.#metadata, metadataInput)
    }
    
    get events() { return this.#events }
    get states() {
        return this.#states
    }
    setStates(statesInput) {
        recurseUpdate(this.#states, statesInput)
    }
}