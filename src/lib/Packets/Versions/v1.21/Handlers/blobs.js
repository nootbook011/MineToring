import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { getRandomDelay } from "#extra/packetRandom"
import { BOTSTATES as botStatus } from '#extra/extraConstants';

export class BlobsHandler extends BaseModule {
    have = []
    missing = []

    resetCache() {
        this.have = []
        this.missing = []
    }
    get hashMap() { return this.bot.world.plugins.BlobsManager }

    getHashesFromChunkPacket(p) {
        const blob_hashes = p?.blobs?.hashes
        if (!blob_hashes) return

        for (const hash of blob_hashes) {
            if (!hash) continue
            if (this.hashMap.hasPayload(hash)) this.have.push(hash)
            else this.missing.push(hash)
        }
    }

    getHashesFromSubChunkPacket(p) {
        for (const entry of p.entries) {
            const hash = entry.blob_id
            if (!hash || entry.result !== 'success') continue
            if (this.hashMap.hasPayload(hash)) this.have.push(hash)
            else this.missing.push(hash)
        }
    }

    startCollectChunks() {
        const bot = this.bot
        bot.packets.on('level_chunk', (p) => {
            this.getHashesFromChunkPacket(p)
        })

        bot.packets.on('subchunk', (p) => {
            this.getHashesFromSubChunkPacket(p)
        })
    }
    startRequestBlobs() {
        const bot = this.bot

        const sendHashes = () => {
            const misses = this.missing.length
            const haves = this.have.length

            bot.packets.queue('client_cache_blob_status', {
                misses,
                haves,
                missing: this.missing,
                have: this.have
            })
            this.resetCache()
            bot.log('world', `request blobs: miss: ${misses}, have: ${haves}`, 0)
        }

        let timerId
        let nextDelay = bot.options.config.fastLoading ? 10 : getRandomDelay(300, 0.1)
        const runRequester = () => {
            if (this.bot.status <= botStatus.Disconnected) return
            const haveData = this.missing.length > 0 || this.have.length > 0;
            if (haveData) {
                sendHashes()
                nextDelay = bot.options.config.fastLoading ? 10 : getRandomDelay(200, 0.1)
            } else {
                nextDelay = 350
            }
            
            timerId = setTimeout(runRequester, nextDelay)
        }

        runRequester()
        this.bot.packets.once('close', () => clearTimeout(timerId))
    }
}