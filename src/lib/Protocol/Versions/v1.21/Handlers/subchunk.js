import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { BedrockThread } from "#Base/BedrockStorage/BedrockThread";
import { packV3, unpackV3, V2, V3, V3ToChunk } from "#extra/extraWorldFunctions"
import { getClampedRandom } from "#extra/packetRandom";
import { BOTSTATES as botStatus } from '#extra/extraConstants';
import constants from "../constants.js";

export function collectSubChunkRequests(loadQueue, origin, minY, maxRequests, onChunkLoaded = () => {}) {
    const requests = []
    const queueLength = loadQueue.length

    for (let i = 0; i < queueLength; i++) {
        if (requests.length >= maxRequests) break

        const packedChunk = loadQueue.next()
        if (packedChunk === undefined) break

        const chunk = unpackV3(packedChunk)
        const dx = chunk.x - origin.x
        const dz = chunk.z - origin.z
        const maxY = minY + chunk.y

        if (minY === maxY) continue

        for (let dy = minY; dy <= maxY; dy++) {
            requests.push({ dx, dy, dz })
        }

        onChunkLoaded(chunk)
    }

    return requests
}

export class SubChunkHandler extends BaseModule {
    loadQueue = new BedrockThread()

    startCollectChunks() {
        this.bot.packets.on('level_chunk', (p) => {
            const { x, z, highest_subchunk_count = constants.dimensions[p.dimension].minCY } = p
            this.loadQueue.add(packV3(x, highest_subchunk_count, z))
        })
    }
    startRequestSubChunks() {
        const packets = this.bot.packets
        const world = this.bot.world
        const player = this.bot.player

        const requestSubChunks = () => {
            if (!world.isCreated || this.loadQueue.length <= 0) return
            const origin = { ...V3ToChunk(player.position), y: 0}
            const dimension = player.dimension
            
            const subchunksToSend = Number(getClampedRandom(35, 3, 65, 0.4).toFixed(0))
            const minY = constants.dimensions[dimension].minCY
            const requests = collectSubChunkRequests(
                this.loadQueue,
                origin,
                minY,
                subchunksToSend,
                (chunk) => world.getDimension(dimension).events.emit('chunkLoaded', chunk)
            )

            if (!requests.length) return
            
            this.bot.log('world', `request subchunks: ${requests.length} total, ${subchunksToSend} needed`, 0)
            packets.queue('subchunk_request', {
                dimension,
                origin,
                requests
            })
        }
        
        const requester = setInterval(() => {
            if (this.bot.status <= botStatus.Disconnected) return
            requestSubChunks()
        }, this.bot.options.config.fastLoading ? 10 : 100)
        
        this.bot.packets.once('close', () => clearInterval(requester))
    }

}