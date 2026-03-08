import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockChunk extends BedrockObjectStorage {
    #db
    #SubChunks = {}
    #isRaw = true

    constructor(db) {
        const metadata = db.getMetadata(db.keys.chunk)
        const data = {
            raw: {
                payload: Buffer.alloc(0),
            },
            decoded: {
                decodeChunk: undefined,
            }
        }

        super({
            metadata,
            data
        }, { safeTypes: false })
        this.#db = db
    }

    buildFromChunkPacket(packet, chunkParser) {
        //console.log(`Building chunk x: ${packet.x}, z: ${packet.z} from chunk packet`)
        this.setMetadata(chunkParser.toChunkMetadata(packet))
        this.setData(chunkParser.toChunkData(packet))
    }

    buildFromSubChunkPacket(packet, subChunkParser) {
        const newResult = subChunkParser.buildChunkSubChunks(packet, this.#db)
        Object.assign(this.#SubChunks, newResult)
    }

    async decodeChunkWithAdapter(adapter) {
        const decodedChunk = await adapter.buildFromBedrockChunk(this)
        
        const subchunks = this.subChunks
        const decodedSubChunks = await adapter.buildFromBedrockSubChunks(this, decodedChunk)
        
        for (const [y, subChunkClass] of Object.entries(subchunks)) {
            const decodeSub = decodedSubChunks[y]
            if (decodeSub === undefined) continue
            
            subChunkClass._setDecodeSubChunk(decodeSub)
        }
        
        this._setDataDecoded({ decodeChunk: decodedChunk })
        this.#isRaw = false
    }
    
    toRaw() {
        this.setData({})
        this.#isRaw = true
    }

    get subChunks() {
        return this.#SubChunks
    }

    get hasChunk() {
        return this.data.raw.payload.length > 0
    }

    get hasSubChunks() {
        return Object.keys(this.subChunks).length > 0
    }

    get isRaw() {
        return this.#isRaw
    }
    
    /**
     * @type {import('prismarine-chunk').BedrockChunk}
     */
    get DChunk() {
        return this.data.decoded.decodeChunk
    }
    DSubChunk(y) {
        return this.subChunks[y].DSubChunk
    }
}