import { BaseModule } from "#Base/BedrockStorage/moduleBase";

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
            if (!chunk.cache_enabled) this.writeStatics.chunksWritten += 1
        })

        bot.packets.on('client_cache_miss_response', (p) => {
            const { blobs } = p
            const blobsManager = bot?.world?.blobsManager
            if (!blobsManager) throw new TypeError('Cannot work with blobs without blobsManager')

            for (const blob of blobs) {
                const chunk = blobsManager.getChunk(blob.hash)
                chunk.buildFromBlob(blob)
                this.writeStatics.chunksWritten += 1
            }
        })
    }

    autoSubchunksWriter() {
        const bot = this.bot
        bot.packets.on('subchunk', (subchunks) => {
            const dimension = bot.world.getDimension(subchunks.dimension)

            dimension.addChunk({ subchunks }, subchunks.origin.x, subchunks.origin.z)
            this.writeStatics.subchunkWritten += 1
        })
    }
}