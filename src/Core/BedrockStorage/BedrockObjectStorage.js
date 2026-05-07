import { recurseUpdate } from "#extra/extraFunctions"

export class BedrockObjectStorage {
    static get base() {
        return {
            metadata: {},
            data: {}
        }
    }
    #main = BedrockObjectStorage.base

    constructor (metadata = undefined, data = undefined) {
        if (metadata) this.setMetadata(metadata)
        if (data) this.setData(data)
    }

    /**
     * Change class metadata
     * @param {Object} metadataInput new metadata object with replace keys
     */
    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }

    /**
     * Change class data
     * @param {Object} dataInput new data object with replace keys
     */
    setData(dataInput) {
        recurseUpdate(this.data, dataInput)
    }

    /**
     * Class metadata Object
     */
    get metadata() {
        return this.#main.metadata
    }

    /**
     * Class data Object
     */
    get data() {
        return this.#main.data
    }

}