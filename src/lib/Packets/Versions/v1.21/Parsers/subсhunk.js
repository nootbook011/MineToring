import { V3 } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';
import decoder from '../Decoders/SubChunkDecoder.js';

export default class Subchunk {
    static metadata(subchunkP = {}, entry = {}) {
        return {
            pos: Subchunk.getSubChunkFromEntry(subchunkP.origin, entry),
            cache: subchunkP.cache_enabled ?? false,
            dimension: subchunkP?.dimension ?? 0,
            hash: entry?.blob_id,
            heightmap_type: entry.heightmap_type ?? 'no_data',
            result: entry?.result ?? 'no_data'
        }
    }

    static getSubChunkFromEntry(origin, entry) {
        return V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
    }

    static buildSubChunks(p, bedrockMap, blobsManager = undefined) {
        const { entries, origin } = p
        let chunk

        for (const subChunk of entries) {
            const pos = Subchunk.getSubChunkFromEntry(origin, subChunk)
            if (chunk?.pos?.x !== pos.x || chunk?.pos?.z !== pos.z) {
                chunk = bedrockMap.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }

            const metadata = Subchunk.metadata(p, subChunk)
            const { payload, heightmap } = subChunk

            let BSubChunk = chunk.getSubChunk(pos.y)
            if (!BSubChunk) {
                BSubChunk = new BedrockSubChunk(metadata)
                BSubChunk.position = metadata.pos
                BSubChunk.setPayload = function (payload) {
                    return Subchunk.updatePayload(payload, this)
                }
                if (payload?.length > 1) BSubChunk.setPayload(payload)

                chunk.setSubChunk(pos.y, BSubChunk)
                if (blobsManager && subChunk?.result === 'success') blobsManager.addHash(metadata.hash, BSubChunk)
            } else {
                BSubChunk.setMetadata(metadata)
                if (payload?.length > 1) BSubChunk.setPayload(payload)
            }
        }
    }

    static updatePayload(payload, bedrockSubChunk) {
        decoder.decodeNetwork(bedrockSubChunk, payload, bedrockSubChunk.metadata.cache)
    }
}