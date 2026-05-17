import { parseLu64 } from "#extra/extraFunctions";
import { V2 } from "#extra/extraWorldFunctions";
import { BedrockChunk } from "#World/bedrockObjects/BaseBedrockChunk";
import decoder from "../Decoders/ChunkDecoder.js";

export default class Chunk {
    static metadata(p = {}) {
        return {
            cache: p.cache_enabled ?? false,
            dimension: p.dimension ?? 0,
            hash: parseLu64(p?.blobs?.hashes),
        }
    }

    static buildChunk(p, BChunk) {
        const { x, z, payload } = p
        const metadata = Chunk.metadata(p)

        BChunk.position = V2(x, z)
        BChunk.setMetadata(metadata)
        if (metadata.cache) BChunk.setBorderBlocksPayload(payload)
        else BChunk.setPayload(payload)

        return BChunk
    }
}