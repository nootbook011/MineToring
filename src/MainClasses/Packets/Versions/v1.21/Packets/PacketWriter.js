import { BaseModule } from "#Base/BedrockStorage/moduleBase";

import { BedrockSubChunk } from "#World/bedrockObjects/BaseBedrockSubChunk"

export class PacketWriter extends BaseModule {
    setupPacketWriter() {
        this.autoStartGameHandler()
        this.autoChunksWriter()
        this.autoSubchunksWriter()
        if (this.bot.options.client.settings.cache) this.autoCacheWriter()
    }

    autoStartGameHandler() {
        const bot = this.bot
        bot.packets.once('start_game', (startgame) => {
            bot.world.create(startgame)
            bot.log('autoph', `World startgame initialized`)
        })
    }

    autoChunksWriter() {
        const bot = this.bot
        bot.packets.on('level_chunk', (chunk) => {
            const dimension = bot.world.getDimension(chunk.dimension)
            dimension.addChunk(chunk)
        })
    }

    autoSubchunksWriter() {
        const bot = this.bot
        bot.packets.on('subchunk', (subchunks) => {
            const dimension = bot.world.getDimension(subchunks.dimension)
            dimension.addSubChunks(subchunks)
        })
    }
    
    autoCacheWriter() {
        const bot = this.bot
        bot.packets.on('client_cache_miss_response', (p) => {
            const { blobs } = p
            const blobsManager = bot?.world?.blobsManager
            if (!blobsManager) throw new TypeError('Cannot work with blobs without blobsManager')

            for (const blob of blobs) {
                const { hash, payload } = blob
                blobsManager.addPayload(hash, payload)
            }
        })
    }
}