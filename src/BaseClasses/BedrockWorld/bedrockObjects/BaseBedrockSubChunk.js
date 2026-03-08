import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockSubChunk extends BedrockObjectStorage {
    #db
    constructor(db) {
        const metadata = db.getMetadata(db.keys.subchunk)

        const data = {
            raw: {
                payload: Buffer.alloc(0),
                heightmap: Buffer.alloc(0)
            },
            decoded: {
                decodeSubChunk: undefined
            }
        }

        super({
            metadata,
            data
        }, { safeTypes: false })
        this.#db = db
    }

    get DSubChunk() {
        return this.data.decoded.decodeSubChunk
    }

    _setDecodeSubChunk(decodeSubChunk) {
        this._setDataDecoded({ decodeSubChunk })
    }



}