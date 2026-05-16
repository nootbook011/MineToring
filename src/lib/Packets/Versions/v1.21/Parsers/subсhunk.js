import { parseLu64 } from '#extra/extraFunctions';
import { V3 } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';
import decoder from '../Decoders/SubChunkDecoder.js';

export default class Subchunk {
    static metadata(subchunkP = undefined, entry = undefined) {
        return {
            cache: subchunkP?.cache_enabled ?? false,
            dimension: subchunkP?.dimension ?? 0,
            hash: parseLu64(entry?.blob_id),
        }
    }

    static getSubChunkFromEntry(origin, entry) {
        return V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
    }

    static buildSubChunks(p, bedrockMap, blobsManager = undefined) {
        const { entries, origin } = p
        /** @type {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk} */
        let chunk

        for (const subChunk of entries) {
            const pos = Subchunk.getSubChunkFromEntry(origin, subChunk)
            if (chunk?.position?.x !== pos.x || chunk?.position?.z !== pos.z) {
                chunk = bedrockMap.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }

            const metadata = Subchunk.metadata(p, subChunk)
            const { payload, heightmap } = subChunk

            const BSubChunk = chunk.createSubChunk(pos.y)
            if (!BSubChunk) continue

            BSubChunk.setMetadata(metadata)
            if (payload?.length > 1) BSubChunk.setPayload(payload)
            if (blobsManager && subChunk?.result === 'success') blobsManager.addHash(metadata.hash, BSubChunk)
            chunk.setSubChunk(BSubChunk.position.y, BSubChunk)
        }
    }
}