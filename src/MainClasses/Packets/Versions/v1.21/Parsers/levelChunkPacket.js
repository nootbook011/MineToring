export default class levelChunkParser {
    static toChunkMetadata(p) {
        return {
            pos: { x: p.x, z: p.z },
            cache: p.cache_enabled,
            dimension: p.dimension,
            subchunksInfo: {
                sub_chunk_count: p.sub_chunk_count,
                highest_subchunk_count: p.highest_subchunk_count
            }
        }
    }

    static toChunkData(p) {
        return {
            payload: Buffer.from(p.payload.data || [])
        }
    }
}