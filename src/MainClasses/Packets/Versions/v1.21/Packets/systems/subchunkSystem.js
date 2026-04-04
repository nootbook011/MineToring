import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { V2, V3, V3ToChunk } from "#extra/extraWorldFunctions"

export default class SubChunkSystem extends BaseModule {
    #signal
    constructor(bot, signal) {
        super(bot)
        this.#signal = signal
    }

    loadedChunks = 0

    loadQueue = {
        0: [],
        1: [],
        2: []
    }

    subChunksRequesterLoop() {
        const packets = this.bot.packets
        const world = this.bot.world
        const playerPos = world.metadata

        const requestSubChunks = () => {
            if (!Object.keys(playerPos).length) return
            const origin = V3ToChunk(playerPos?.players?.spawnpoint?.actual)
            const dimension = playerPos?.players?.spawnpoint?.dimension
            if (this.loadQueue[dimension].length <= 0) return

            const minY = -4
            const requests = []
            const chunks = this.loadQueue[dimension].splice(0, 3)
            this.loadedChunks += 3

            for (const chunk of chunks) {
                const data = world.getDimension(dimension).getChunk(chunk.x, chunk.z).metadata
                const dx = origin.x - chunk.x
                const dz = origin.z - chunk.z
                const maxY = minY + data.subchunksInfo.highest_subchunk_count

                for (let dy = minY; dy <= maxY; dy++) {
                    requests.push({ dx, dy, dz })
                }
            }

            const packet = {
                dimension,
                origin,
                requests
            }
            packets.queue('subchunk_request', packet)
        }

        const requester = setInterval(() => {
            requestSubChunks()
        }, 100)

        this.#signal.addEventListener('abort', () => clearInterval(requester), { once: true });

        packets.on('level_chunk', (p) => {
            const { dimension, x, z } = p
            this.loadQueue[dimension].push(V2(x, z))
        })
    }

}