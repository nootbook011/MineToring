import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { BedrockThread } from "#Base/BedrockStorage/BedrockThread";
import { V2, V3, V3ToChunk } from "#extra/extraWorldFunctions"
import { getClampedRandom } from "#extra/packetRandom";

export default class SubChunkSystem extends BaseModule {
    #signal
    constructor(bot, signal) {
        super(bot)
        this.#signal = signal
    }

    loadedChunks = 0

    loadQueue = {
        0: new BedrockThread(),
        1: new BedrockThread(),
        2: new BedrockThread()
    }

    subChunksDataWriter() {
        const packets = this.bot.packets
        packets.on('level_chunk', (p) => {
            const { dimension, x, z } = p
            this.loadQueue[dimension].add(V2(x, z))
        })
    }

    subChunksRequesterLoop() {
        const packets = this.bot.packets
        const world = this.bot.world
        const playerPos = world.metadata

        const requestSubChunks = () => {
            if (!world.isInited) return
            const origin = { ...V3ToChunk(playerPos?.players?.spawnpoint?.actual), y: 0}
            const dimension = playerPos?.players?.spawnpoint?.dimension
            if (this.loadQueue[dimension].length <= 0) return
            
            const subchunksToSend = getClampedRandom(35, 3, 65, 0.4).toFixed(0)
            const minY = -4
            const requests = []

            for (let i = 0; i < this.loadQueue[dimension].length; i++) {
                if (requests.length >= subchunksToSend) break
                const chunk = this.loadQueue[dimension].next()
                this.loadedChunks++

                const data = world.getDimension(dimension).getChunk(chunk.x, chunk.z).metadata
                const dx = chunk.x - origin.x
                const dz = chunk.z - origin.z
                const maxY = minY + data.subchunksInfo.highest_subchunk_count

                for (let dy = minY; dy <= maxY; dy++) {
                    requests.push({ dx, dy, dz })
                }
            }
            this.bot.log('world', `request subchunks: ${requests.length} total, ${subchunksToSend} needed`)
            packets.queue('subchunk_request', {
                dimension,
                origin,
                requests
            })
        }
        
        const requester = setInterval(() => {
            if (this.#signal.aborted) return
            requestSubChunks()
        }, 100)
        
        this.#signal.addEventListener('abort', () => clearInterval(requester), { once: true });
    }

}