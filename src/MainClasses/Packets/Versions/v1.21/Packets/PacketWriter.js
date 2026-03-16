import { BaseModule } from "#Base/BedrockStorage/moduleBase";

import { BedrockChunk } from "#World/bedrockObjects/BaseBedrockChunk"
import { BedrockSubChunk } from "#World/bedrockObjects/BaseBedrockSubChunk"

export class PacketWriter extends BaseModule {
    writeStatics = {
        startgameInited: false,
        chunksWritten: 0,
        subchunkWritten: 0
    }

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
            this.writeStatics.startgameInited = true
            bot.log('autoph', `World startgame initialized`)
        })
    }

    autoChunksWriter() {
        const bot = this.bot
        bot.packets.on('level_chunk', (chunk) => {
            const dimension = bot.world.getDimension(chunk.dimension)
            dimension.addChunk({ chunk }, chunk.x, chunk.z)
            this.writeStatics.chunksWritten += 1
        })
    }

    autoSubchunksWriter() {
        const bot = this.bot
        bot.packets.on('subchunk', (subchunks) => {
            const dimension = bot.world.getDimension(subchunks.dimension)

            dimension.addChunk({ subchunks }, subchunks.origin.x, subchunks.origin.z)
            if (!subchunks.cache_enabled) this.writeStatics.subchunkWritten += 1
        })
    }
    
    autoCacheWriter() {
        const bot = this.bot
        bot.packets.on('client_cache_miss_response', (p) => {
            const { blobs } = p
            const blobsManager = bot?.world?.blobsManager
            if (!blobsManager) throw new TypeError('Cannot work with blobs without blobsManager')

            for (const blob of blobs) {
                const value = blobsManager.getHash(blob.hash)
                
                if (value instanceof BedrockChunk) {
                    value.buildFromBlob(blob)
                    this.writeStatics.chunksWritten += 1
                }
                else if (value instanceof BedrockSubChunk) {
                    value.setData({ payload: blob.payload })
                    this.writeStatics.subchunkWritten += 1
                }
            }
        })
    }
}