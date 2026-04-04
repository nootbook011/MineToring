import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { BigIntToLu64, parseLu64 } from "#extra/extraFunctions"
import { getClampedRandom, getRandomDelay } from "#extra/packetRandom"

export default class BlobsSystem extends BaseModule {
    #signal
    constructor(bot, signal) {
        super(bot)
        this.#signal = signal
    }

    have = []
    missing = new Set()
    get hashMap() { return this.bot.world.blobsManager }

    getHashesFromChunkPacket(p) {
        // in 1.21.50 - official client does not request data from level chunk packet
        const blob_hashes = p?.blobs?.hashes
        if (!blob_hashes) return

        for (const hash of blob_hashes) {
            this.have.push(parseLu64(hash))
        }
    }

    getHashesFromSubChunkPacket(p) {
        for (const entry of p.entries) {
            const hash = entry.blob_id
            if (!hash) continue
            if (this.hashMap.hasSubChunkData(hash)) this.have.push(parseLu64(hash))
            else this.missing.add(parseLu64(hash))
        }
    }

    blobsRequesterLoop() {
        const bot = this.bot
        let lastSend = new Date()
        let sizeToSend = getClampedRandom(80, 60, 100, 0.3)
        let randomDelay = getRandomDelay(300, 0.1)

        const sendHashes = () => {
            const misses = this.missing.size
            const haves = this.have.length
            const missingArr = Array.from(this.missing, (v) => BigIntToLu64(v))
            const haveArr = this.have.map((v) => BigIntToLu64(v))

            bot.packets.queue('client_cache_blob_status', {
                misses,
                haves,
                missing: missingArr,
                have: haveArr
            })

            lastSend = new Date()
            this.have = []
            this.missing.clear()
            sizeToSend = getClampedRandom(80, 60, 100, 0.3)
            bot.log('world', `request blobs: miss: ${misses}, have: ${haves}`)
        }

        bot.packets.on('level_chunk', (p) => {
            this.getHashesFromChunkPacket(p)
        })

        bot.packets.on('subchunk', (p) => {
            this.getHashesFromSubChunkPacket(p)
        })

        const chunkSaverloop = setInterval(() => {
            if (this.missing.size + this.have.length >= sizeToSend) {
                sendHashes()
                return
            }

            const haveData = this.missing.size > 0 || this.have.length > 0
            const timeout = Date.now() - lastSend >= randomDelay
            if (haveData && timeout) {
                sendHashes()
                randomDelay = getRandomDelay(300, 0.1)
            }
        }, 350);

        this.#signal.addEventListener('abort', () => clearInterval(chunkSaverloop), { once: true });
    }
}