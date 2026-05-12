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
    constructor (metadata) {
        if (metadata) this.setMetadata(metadata)
    }

    get protocol() { return this.#protocol }
    get registry() { return this.#registry }

    async init(protocol = undefined, registry = undefined, version = undefined) {
        await this.initProtocol(protocol, version)
        this.initRegistry(registry, version)
    }

    async initProtocol(protocol = undefined, version = undefined) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else if (version) this.#protocol = await ProtocolLoader.getProtocol(version)
        else return
    }
    initRegistry(registry = undefined, version = undefined) {
        if (!registry && this.#protocol && version) {
            this.#registry = new this.#protocol.BedrockRegistry(version)
            this.#registry.loadRuntimeIds()
        }
        else this.#registry = registry
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