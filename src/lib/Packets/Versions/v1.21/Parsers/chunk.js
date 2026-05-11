import { V2 } from "#extra/extraWorldFunctions";
import { BedrockChunk } from "#World/bedrockObjects/BaseBedrockChunk";
import decoder from "../Decoders/ChunkDecoder.js";

export default class Chunk {
    static metadata(p = {}) {
        return {
            pos: V2(p.x ?? 0, p.z ?? 0),
            cache: p.cache_enabled ?? false,
            dimension: p.dimension ?? 0,
            hash: p?.blobs?.hashes ?? undefined,
            highest_subchunk_count: p.highest_subchunk_count ?? 0
        }
    }

    static createChunk(v2, dimension, BChunk) {
        const { x, z } = v2
        const metadata = Chunk.metadata({ x, z, dimension })
        BChunk.setMetadata(metadata)
        BChunk.position = metadata.pos
    }

    static buildChunk(p, BChunk) {
        const { payload } = p
        const metadata = Chunk.metadata(p)

        BChunk.setMetadata(metadata)
        BChunk.position = metadata.pos
        BChunk.setPayload(payload)

        return BChunk
    }

    static updatePayload(payload, bedrockChunk) {
        decoder.decodeNetwork(bedrockChunk, payload, bedrockChunk.metadata.cache)
    }
}