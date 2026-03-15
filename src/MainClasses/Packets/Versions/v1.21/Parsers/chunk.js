import { V2 } from "#extra/extraWorldFunctions";

export default class chunkParser {
    static metadata(p = {}) {
        return {
            pos: V2(p.x || 0, p.z || 0),
            cache: p.cache_enabled || false,
            dimension: p.dimension || 0,
            hash: p?.blobs?.hashes || [],
            subchunksInfo: {
                sub_chunk_count: p.sub_chunk_count || -2,
                highest_subchunk_count: p.highest_subchunk_count || 0
            }
        }
    }
    
    static data(p = {}) {
        return {
            payload: Buffer.from(p.payload || Buffer.alloc(0))
        }
    }
}