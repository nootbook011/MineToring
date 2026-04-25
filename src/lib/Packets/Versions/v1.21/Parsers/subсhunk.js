import { V3 } from '#extra/extraWorldFunctions';
import { BedrockSubChunk } from '#World/bedrockObjects/BaseBedrockSubChunk';

export default class Subchunk {
    static metadata(subchunkP = {}, entry = {}) {
        return {
            cache: subchunkP.cache_enabled || false,
            hash: entry?.blob_id,
            pos: Subchunk.getSubChunkFromEntry(subchunkP.origin, entry),
            dimension: subchunkP.dimension,
            heightmap_type: entry.heightmap_type || 'no_data'
        }
    }
    
    static data(entry = undefined) {
        return {
            payload: Buffer.from(entry?.payload || Buffer.alloc(0)),
            heightmap: Buffer.from(entry?.heightmap || Buffer.alloc(0))
        }
    }
    
    static getSubChunkFromEntry(origin, entry) {
        if (!entry || !origin) return V3(0,0,0)
        return V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
    }
    
    static buildSubChunks(p, bedrockMap, blobsManager = undefined) {
        const { entries, origin } = p
        let chunk
        
        for (const subChunk of entries) {
            if (subChunk.result !== 'success') continue
            const pos = Subchunk.getSubChunkFromEntry(origin, subChunk)
            if (chunk?.metadata?.pos?.x !== pos.x || chunk?.metadata?.pos?.z !== pos.z) {
                chunk = bedrockMap.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }
            
            const metadata = Subchunk.metadata(p, subChunk)
            const data = Subchunk.data(subChunk)
            
            let BSubChunk = chunk.getSubChunk(pos.y)
            if (!BSubChunk) {
                BSubChunk = new BedrockSubChunk(metadata, data)
                chunk.setSubChunk(pos.y, BSubChunk)
                if (blobsManager) blobsManager.addHash(metadata.hash, BSubChunk)
            } else {
                BSubChunk.setMetadata(metadata)
                BSubChunk.setData(data)
            }
            
            //console.log(`subchunk ${pos.y} join to chunk x: ${chunk.metadata.pos.x}, z: ${chunk.metadata.pos.z}`)
        }
    }
}