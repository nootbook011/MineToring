import { V3, V3ToChunk, toSignedIndex } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';

export default class subchunkParser {
    static metadata(subchunkP = {}, entry = {}) {
        return {
            cache: subchunkP.cache_enabled || false,
            pos: V3(
                subchunkP.origin.x || 0,
                entry.dy > 20 ? toSignedIndex(dy) : dy || 0,
                subchunkP.origin.z || 0
                ),
            dimension: subchunkP.dimension,
            heightmap_type: entry.heightmap_type || 'no_data'
        }
    }
    
    static data(entry = undefined) {
        return {
            payload: Buffer.from(entry?.payload || Buffer.alloc(0)),
            heightmap: Buffer.from(entry?.heightmap || Buffer.alloc(0))
        }
    }
    
    static buildSubChunks(p) {
        const { origin, cache_enabled, dimension, entries } = p
        const result = {}
        
        for (const subChunk of entries) {
            const subChunkClass = subChunkParser.buildSubChunkFromEntry(subChunk, p)
            if (subChunkClass === undefined) continue
            //console.log(`subchunk ${subChunk.dy} join to chunk x: ${subChunksPos.x}, z: ${subChunksPos.z} (bx: ${origin.x}, bz: ${origin.z})`)

            result[subChunkClass.metadata.pos.y] = subChunkClass
        }
        return result
    }

    static buildSubChunkFromEntry(entry, p) {
        if (entry?.result !== 'success') return undefined

        const subChunkClass = new BedrockSubChunk(subchunkParser)

        subChunkClass.setMetadata(subchunkParser.metadata(p, entry))
        subChunkClass.setData(subchunkParser.data(entry))
        return subChunkClass
    }
}

