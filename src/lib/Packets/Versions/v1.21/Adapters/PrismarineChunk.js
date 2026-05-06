import PrismarineChunk from "prismarine-chunk";
import { BaseChunkAdapter } from "#Packets/Versions/vDefault/Adapters/BaseChunkAdapter"

export default class PrismarineChunkAdapter extends BaseChunkAdapter {
    #registry
    #pchunkConstructor

    /**
     * Build PrismarineChunk from BedrockChunk instance
     * @param {*} BedrockChunk BedrockChunk instance to build from
     * @param {*} PChunk Optional PrismarineChunk instance to build into
     * @returns {Promise<PrismarineChunk>}
     */
    static async buildFromBedrockChunk(BedrockChunk, PChunk = null) {
        if (!BedrockChunk.isRaw) return BedrockChunk.PChunk
        const rawData = BedrockChunk.data.raw
        const metadata = BedrockChunk.metadata

        PChunk = PChunk ?? this.initPChunk(metadata.pos)
        
        const optionsDecode = {
            cache: metadata.cache
        }
        if (BedrockChunk.hasChunk) {
            await this._decodeChunk(
                rawData.payload,
                {...optionsDecode, subChunksCount: metadata.subchunksInfo.sub_chunk_count},
                PChunk
            )
        }
        
        if(BedrockChunk.hasSubChunks) {
            for (const [y, BsubChunkClass] of Object.entries(BedrockChunk.subChunks)) {
                await this._decodeSubChunk(BsubChunkClass.data.raw.payload, y, optionsDecode, PChunk)
            }
        }

        return PChunk
    }
    
    static async buildFromBedrockSubChunks(BedrockChunk, PChunk) {
        const result = {}
        for (const y of Object.keys(BedrockChunk.subChunks)) {
            result[y] = PChunk.getSectionAtIndex(y)
        }
        return result
    }
    
    initValidator(args) {
        const { registry } = args

        this.#registry = registry
        return this
    }
    
    async _decodeChunk(payloadBuffer, options = {}, PChunk) {
        const { cache = false } = options
        
        if (!cache) {
            // cache false
            const { subChunksCount } = options
            await PChunk.networkDecodeNoCache(payloadBuffer, Number(subChunksCount))
        } else {
            return false
        }
        
        return true
    }
    
    async _decodeSubChunk(payloadBuffer, y, options = {}, PChunk) {
        const { cache = false } = options
        
        if (!cache) {
            // cache false
            await PChunk.networkDecodeSubChunkNoCache(Number(y), payloadBuffer)
        } else {
            return false
        }
        
        return true
    }
    
}