import { recurseUpdate } from "#extra/extraFunctions"

export class BedrockObjectStorage {
    #metadata = {}

    constructor (metadata = undefined) {
        if (metadata) this.setMetadata(metadata)
    }

    /**
     * Change class metadata
     * @param {Object} metadataInput new metadata object with replace keys
     */
    setMetadata(metadataInput) {
        recurseUpdate(this.#metadata, metadataInput)
    }

    /**
     * Class metadata Object
     */
    get metadata() {
        return this.#metadata
    }

}