import { V3, toSignedIndex } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';

export default class subchunkParser {
    static metadata(subchunkP = {}, entry = {}) {
        return {
            cache: subchunkP.cache_enabled || false,
            hash: entry?.blob_id,
            pos: V3(
                subchunkP?.origin?.x || 0,
                entry.dy > 20 ? toSignedIndex(entry.dy) : entry?.dy || 0,
                subchunkP?.origin?.z || 0
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
    
    static buildSubChunks(p, blobsManager = undefined) {
        const { entries } = p
        const result = {}
        
        for (const subChunk of entries) {
            const subChunkClass = subchunkParser.buildSubChunkFromEntry(subChunk, p)
            if (subChunkClass === undefined) continue
            console.log(`subchunk ${subChunkClass.metadata.pos.y} join to chunk x: ${p.origin.x}, z: ${p.origin.z}`)
            if (blobsManager) blobsManager.setHash(subChunkClass.metadata.hash, subChunkClass)
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

