import { BedrockProtocol, ProtocolLoader } from "#Packets/ProtocolLoader";
import { recurseUpdate } from "#extra/extraFunctions"

/**
 * @template {Record<string, any>} T
 */
export class BedrockObjectStorage {
    /**
     * @type {T}
     * @private
     */
    #metadata = {}

    /** @type {BedrockProtocol} */
    #protocol
    /** @type {import("minecraft-data").IndexedData} */
    #registry

    /**
     * @param {T} [metadata]
     */
    constructor(metadata, protocol = undefined, registry = undefined) {
        if (metadata) this.setMetadata(metadata)
        if (protocol) this.protocol = protocol
        if (registry) this.registry = registry
    }

    get protocol() { return this.#protocol }
    set protocol(protocol) {
        if (protocol instanceof BedrockProtocol) {
            this.#protocol = protocol
        } else {
            throw new TypeError(`Instance of BedrockProtocol class is needed for initialization.`)
        }
    }

    get registry() { return this.#registry }
    set registry(registry) {
        this.#registry = registry
    }

    async init(version) {
        this.#protocol = await ProtocolLoader.getProtocol(version)
        this.#registry = new this.#protocol.BedrockRegistry(version)
        this.#registry.loadHashedRuntimeIds()
    }

    /**
     * decodes new payload of data using a special function that is automatically adjusted to a specific version.
     */
    setPayload(payload) { }

    /**
     * Change class metadata
     * @param {Partial<T>} metadataInput
     */
    setMetadata(metadataInput) {
        recurseUpdate(this.#metadata, metadataInput)
    }

    /**
     * Class metadata object
     * @returns {T}
     */
    get metadata() {
        return this.#metadata
    }
}