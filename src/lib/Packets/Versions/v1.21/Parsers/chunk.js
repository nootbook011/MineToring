export default class Chunk {
    /** @param {import('#World/bedrockObjects/BaseBedrockChunk').BedrockChunk} BChunk */
    static buildChunk(p, BChunk, blobsManager = undefined) {
        const { x, z, dimension, cache_enabled: cache, payload } = p

        BChunk.create(x, z, dimension)
        if (cache && blobsManager) blobsManager.addHash(p.blobs?.hashes, BChunk)
        
        if (cache) BChunk.setBorderBlocksPayload(payload)
        else BChunk.setPayload(payload, cache)

        return BChunk
    }
}