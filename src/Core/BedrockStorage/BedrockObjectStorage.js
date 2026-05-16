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
    constructor(metadata) {
        if (metadata) this.setMetadata(metadata)
    }

    get protocol() { return this.#protocol }
    get registry() { return this.#registry }

    init(version = undefined, protocol = undefined, registry = undefined) {
        if (version) {
            return (async () => {
                this.#protocol = await ProtocolLoader.getProtocol(version)
                this.#registry = new this.#protocol.BedrockRegistry(version)
                this.#registry.loadRuntimeIds()
                return this
            })()
        } else {
            if (protocol instanceof BedrockProtocol) {
                this.#protocol = protocol
                this.#registry = registry
            } else {
                throw new TypeError(`Instance of BedrockProtocol class is needed for initialization.`)
            }
        }
    }

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