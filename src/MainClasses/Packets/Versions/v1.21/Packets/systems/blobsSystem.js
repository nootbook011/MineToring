import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { getRandomDelay } from "#extra/packetRandom"

export default class BlobsSystem extends BaseModule {
    #signal
    constructor(bot, signal) {
        super(bot)
        this.#signal = signal
    }

    have = []
    missing = []

    resetCache() {
        this.have = []
        this.missing = []
    }
    get hashMap() { return this.bot.world.blobsManager }

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

    blobsDataWriter() {
        const bot = this.bot
        bot.packets.on('level_chunk', (p) => {
            this.getHashesFromChunkPacket(p)
        })

        bot.packets.on('subchunk', (p) => {
            this.getHashesFromSubChunkPacket(p)
        })
    }

    blobsRequesterLoop() {
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
            bot.log('world', `request blobs: miss: ${misses}, have: ${haves}`)
        }

        let timerId
        let nextDelay = getRandomDelay(300, 0.1)
        const runRequester = () => {
            if (this.#signal.aborted) return
            const haveData = this.missing.length > 0 || this.have.length > 0;
            if (haveData) {
                sendHashes()
                nextDelay = getRandomDelay(200, 0.1)
            } else {
                nextDelay = 350
            }
            
            timerId = setTimeout(runRequester, nextDelay)
        };

        runRequester()
        this.#signal.addEventListener('abort', () => clearTimeout(timerId), { once: true })
    }
}