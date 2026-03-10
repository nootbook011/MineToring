import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockChunk extends BedrockObjectStorage {
    #req = {
        db,
        parser
    }
    #SubChunks = {}
    #isRaw = true

    constructor(db) {
        const parser = db.getParser(db.keys.chunk)
        
        const metadata = parser.metadata()
        const data = {
            raw: parser.data(),
            decoded: {
                decodeChunk: undefined,
            }
        }

        super({
            metadata,
            data
        }, { safeTypes: false })
        this.#req.db = db
        this.#req.parser = parser
    }

    buildFromChunkPacket(packet) {
        //console.log(`Building chunk x: ${packet.x}, z: ${packet.z} from chunk packet`)
        const parser = this.#req.parser
        this.setMetadata(parser.metadata(packet))
        this.setData(parser.data(packet))
    }

    buildFromSubChunkPacket(packet) {
        const parser = this.#req.db.getParser(this.#req.db.keys.subchunk)
        const newResult = parser.buildSubChunks(packet)
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
    
    get cache() {
        return this.metadata.cache
    }
    
    get hashes() {
        return this.metadata.subchunksInfo.hashes
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