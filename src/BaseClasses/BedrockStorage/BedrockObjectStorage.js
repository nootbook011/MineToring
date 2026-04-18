import { recurseUpdate } from "#extra/extraFunctions"

export class BedrockObjectStorage {
    static get base() {
        return {
            metadata: {},
            data: {
                raw: {},
                decoded: {}
            }
        }
    }
    #main = BedrockObjectStorage.base

    constructor (metadata = undefined, data = undefined) {
        if (metadata) this.setMetadata(metadata)
        if (data) this.setData(data)
    }

    /**
     * Change Chunk.metadata
     * @param {Object} metadataInput keys in Chunk.metadata with his values
     */
    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }

    /**
     * Change Chunk.data.raw, also delete all exested decoded data
     * @param {object} rawDataInput keys in Chunk.data.raw with his values, accepts only raw data
     */
    setData(rawDataInput) {
        this.#main.data.decoded = BedrockObjectStorage.base.data
        recurseUpdate(this.data.raw, rawDataInput)
    }

    _setDataDecoded(decodedDataInput) {
        recurseUpdate(this.data.decoded, decodedDataInput)
    }

    get metadata() {
        return this.#main.metadata
    }

    get data() {
        return this.#main.data
    }

}