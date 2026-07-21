import { BedrockRegistry } from "./BedrockRegistry.js"
import { recurseUpdate } from "#extra/extraFunctions"

export class BedrockDependencies {
    /** @type {import("minecraft-data").IndexedData} */
    #registry
    
    constructor(registry = undefined) {
        if (registry) this.registry = registry
    }
    
    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }

    async init(version) {
        this.#registry = new BedrockRegistry(version)
    }
}