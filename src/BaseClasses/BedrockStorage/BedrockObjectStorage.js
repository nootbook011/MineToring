import { safeUpdate } from "#extra/extraFunctions"

export class BedrockObjectStorage {
    #storageMain
    #storageBase
    #options

    constructor(baseObject = null, options = { safeTypes: true }) {
        baseObject ||= {
            metadata: {},
            data: {
                raw: {},
                decoded: {}
            }
        }

        this.#storageMain = baseObject
        this.#storageBase = structuredClone(baseObject)
        this.#options = options
    }

    /**
 * Change Chunk.metadata
 * @param {Object} metadataInput keys in Chunk.metadata with his values
 */
    setMetadata(metadataInput) {
        safeUpdate(this.metadata, metadataInput, this.#storageBase.metadata, this.#options)
    }

    /**
     * Change Chunk.data.raw, also delete all exested decoded data
     * @param {object} rawDataInput keys in Chunk.data.raw with his values, accepts only raw data
     */
    setData(rawDataInput) {
        const baseData = this.#storageBase.data
        this.#storageMain.data.decoded = structuredClone(baseData.decoded)
        safeUpdate(this.data.raw, rawDataInput, baseData.raw, this.#options)
    }

    _setDataDecoded(decodedDataInput) {
        safeUpdate(this.data.decoded, decodedDataInput, this.#storageBase.data.decoded, this.#options)
    }

    get metadata() {
        return this.#storageMain.metadata
    }

    get data() {
        return this.#storageMain.data
    }

}