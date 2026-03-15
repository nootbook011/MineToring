import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockSubChunk extends BedrockObjectStorage {
    constructor(parser) {
        const metadata = parser.metadata()

        const data = {
            raw: parser.data(),
            decoded: {
                decodeSubChunk: undefined
            }
        }

        super({
            metadata,
            data
        }, { safeTypes: false })
    }

    get hasPayload() {
        return this.data.raw.payload.length > 1
    }

    get DSubChunk() {
        return this.data.decoded.decodeSubChunk
    }

    _setDecodeSubChunk(decodeSubChunk) {
        this._setDataDecoded({ decodeSubChunk })
    }



}