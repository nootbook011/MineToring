import { parseLu64 } from '#extra/extraFunctions';
import { V3 } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';
import decoder from '../Decoders/SubChunkDecoder.js';

export default class Subchunk {
    static buildSubChunks(p, bedrockMap, blobsManager = undefined) {
        const { entries, origin, cache_enabled: cache } = p
        /** @type {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk} */
        let chunk

        for (const entry of entries) {
            const pos = V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
            if (chunk?.position?.x !== pos.x || chunk?.position?.z !== pos.z) {
                chunk = bedrockMap.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }

            const { payload, heightmap, result, blob_id: hash } = entry
            const BSubChunk = chunk.createSubChunk(pos.y)
            if (!BSubChunk) continue

            if (cache) BSubChunk.setBlocksEntityPayload(payload)
            else BSubChunk.setPayload(payload, cache)
            
            if (cache && blobsManager && result === 'success') blobsManager.addHash(hash, BSubChunk)
        }
    }
}