import { V3ToChunk, toSignedIndex } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';

export default class subChunkParser {
    static buildChunkSubChunks(p, db) {
        const { origin, cache_enabled, dimension, entries } = p
        const subChunksPos = origin
        const result = {}

        const baseMeta = {
            cache: cache_enabled,
            pos: subChunksPos,
            dimension,
        }

        for (const subChunk of entries) {
            const subChunkClass = subChunkParser.buildSubChunk(subChunk, baseMeta, db)
            if (subChunkClass === undefined) continue
            //console.log(`subchunk ${subChunk.dy} join to chunk x: ${subChunksPos.x}, z: ${subChunksPos.z} (bx: ${origin.x}, bz: ${origin.z})`)

            result[subChunk.dy] = subChunkClass
        }
        return result
    }

    static buildSubChunk(entrySubChunk, baseMeta = {}, db) {
        // {"dx":0,"dy":-4,"dz":0,"result":"chunk_not_found","payload":{"type":"Buffer","data":[]},"heightmap_type":"no_data"}
        const { result, dy, payload, heightmap_type } = entrySubChunk
        if (result !== 'success') return undefined

        const subChunkClass = new BedrockSubChunk(db)

        subChunkClass.setMetadata({
            ...baseMeta,
            pos: { ...baseMeta.pos, y: dy > 20 ? toSignedIndex(dy) : dy },
            heightmap_type
        })
        subChunkClass.setData({
            payload: Buffer.from(payload.data || []),
            heightmap: Buffer.from(entrySubChunk?.heightmap?.data || [])
        })
        return subChunkClass
    }
}

