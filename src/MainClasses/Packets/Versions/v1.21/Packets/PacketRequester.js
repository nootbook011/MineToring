import { BaseModule } from "#Base/BedrockStorage/moduleBase"

export class PacketRequester extends BaseModule {
    #signal
    constructor (bot, signal) {
        super(bot)
        this.#signal = signal
    }

    

    subchunksRequesterLoop() {
        const bot = this.bot.packets
        const loop = (p) => { this.requestSubChunk(p) }

        bot.on('level_chunk', loop)
        return loop
    }

    requestSubChunk(p) {
        const { highest_subchunk_count, dimension, x, z } = p
        const bot = this.bot.packets

        const requests = []
        const minY = -4
        const maxY = minY + highest_subchunk_count

        for (let y = minY; y <= maxY; y++) {
            requests.push({ dx: 0, dy: y, dz: 0 })
        }

        const subChunkRequest = {
            dimension: dimension,
            origin: V3(x, 0, z),
            requests
        }
        bot.queue("subchunk_request", subChunkRequest)
    }
}