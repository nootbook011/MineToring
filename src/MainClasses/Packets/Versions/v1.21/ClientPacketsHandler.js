import BPMain from '../vDefault/ClientPacketsHandler.js'
import { V3 } from '#extra/extraWorldFunctions'
import { randomSleep, randomTime } from "#extra/packetRandom"

export default class PacketsMain extends BPMain {

    connectHandler() {
        const client = this._getClient.packets
        const options = this.options

        const rpResponse = (_ = {}) => {
            client.write('resource_pack_client_response', {
                response_status: 'completed',
                resourcepackids: []
            })
        }

        client.once('resource_packs_info', (_) => {
            rpResponse()
            client.write('client_cache_status', { enabled: options?.client?.settings?.cache ?? false })

            client.once('resource_pack_stack', rpResponse)
            client.once('level_chunk', (_) => {
                client.queue('request_chunk_radius', { chunk_radius: options?.client?.settings?.viewDistance || 10 })
            })


        })
    }

    playerSimulation() {
        const client = this._getClient.packets
        const options = this.options
        let check

        client.once('level_chunk', (_) => {
            client.queue('serverbound_loading_screen', { type: 1 })
            this._getClient.log('playersimulation', 'Loading screen: Phase 1 (Started)')
            check = Date.now()
        })

        client.once('spawn', (_) => {
            client.queue('serverbound_loading_screen', { type: 2 })
            this._getClient.log('playersimulation', `Loading screen: Phase 2 (Finished after ~${Date.now() - check}ms)`)
        })
    }

    #requestSCWithCache(p) {
        const { x, z, sub_chunk_count, dimension, blob_hashes } = p
        if (!blob_hashes) return
        const client = this._getClient
        const hashDimension = client.world.getDimension(dimension).hashes
        
        const missing = []
        const have = []
        
        for (const h of blob_hashes) {
            if (hashDimension.has(h)) have.push(h)
            else missing.push(h)
        }
        
        if (missing.length > 0 || have.length > 0) {
            const blobStatus = {
                misses: missing.length,
                haves: have.length,
                missing,
                have
            }
            
            client.queue('client_cache_blob_status', blobStatus)
        }
    }
    
    #requestSCNoCache(p) {
        const { highest_subchunk_count, dimension, x, z } = p
        const client = this._getClient.packets
        
        const requests = []
        const minY = -4
        const maxY = minY + highest_subchunk_count

        for (let y = minY; y <= maxY; y++) {
            requests.push({ dx: 0, dy: y, dz: 0 })
        }

        const subChunkRequest = {
            dimension: dimension,
            origin: V3(x, 0, z),
            requests,
            requests_length: requests.length
        }
        client.queue("subchunk_request", subChunkRequest)
    }
    
    requestSubChunk(chunkPacket) {
        const cache = chunkPacket.cache_enabled
        
        if (cache) this.#requestSCWithCache(chunkPacket)
        else this.#requestSCNoCache(chunkPacket)
    }

    chunksRequesterLoop() {
        const client = this._getClient.packets
        const loop = (p) => this.requestSubChunk(p)

        client.on('level_chunk', loop)
        return loop
    }
}