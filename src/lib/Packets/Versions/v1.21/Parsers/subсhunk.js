import { V3 } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';
import decoder from '../Decoders/SubChunkDecoder.js';

export default class Subchunk {
    static metadata(subchunkP = undefined, entry = undefined) {
        return {
            pos: subchunkP ? Subchunk.getSubChunkFromEntry(subchunkP.origin, entry) : V3(0, 0, 0),
            cache: subchunkP?.cache_enabled ?? false,
            dimension: subchunkP?.dimension ?? 0,
            hash: entry?.blob_id ?? undefined,
            heightmap_type: entry?.heightmap_type ?? 'no_data',
        }
    }

    static chunkMetadataToSubChunk(chunkMetadata, y) {
        const { pos: chunkPos, cache, dimension } = chunkMetadata

        return {
            ...Subchunk.metadata(),
            pos: V3(chunkPos.x, y, chunkPos.z),
            cache,
            dimension,
            hash: undefined
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
            if (chunk?.position?.x !== pos.x || chunk?.position?.z !== pos.z) {
                chunk = bedrockMap.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }

            const metadata = Subchunk.metadata(p, subChunk)
            const { payload, heightmap } = subChunk

            const BSubChunk = new BedrockSubChunk(metadata)
            subChunk.setPayload = function (payload) {
                return Subchunk.updatePayload(payload, this)
            }
            BSubChunk.position = metadata.pos
            if (payload?.length > 1) BSubChunk.setPayload(payload)
            if (blobsManager && subChunk?.result === 'success') blobsManager.addHash(metadata.hash, BSubChunk)
            chunk.setSubChunk(metadata.pos.y, BSubChunk)
        }
    }

    static updatePayload(payload, bedrockSubChunk) {
        decoder.decodeNetwork(bedrockSubChunk, payload, bedrockSubChunk.metadata.cache)
    }
}