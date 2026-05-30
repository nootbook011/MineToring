import { BedrockProtocol, ProtocolLoader } from "#Packets/ProtocolLoader";
import { recurseUpdate } from "#extra/extraFunctions"

export class BedrockObjectStorage {
    /** @type {BedrockProtocol} */
    #protocol
    /** @type {import("minecraft-data").IndexedData} */
    #registry
    
    constructor(protocol = undefined, registry = undefined) {
        if (protocol) this.protocol = protocol
        if (registry) this.registry = registry
    }
    
    get protocol() { return this.#protocol }
    set protocol(protocol) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else throw new TypeError(`Instance of BedrockProtocol class is needed for initialization.`)
    }
    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }

    async init(version) {
        this.#protocol = await ProtocolLoader.getProtocol(version)
        this.#registry = new this.#protocol.BedrockRegistry(version)
    }
}