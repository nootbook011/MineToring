import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { BigIntToLu64 } from "#extra/extraFunctions"
import { parseBigInt } from "#extra/extraWorldFunctions"
import { getClampedRandom, getRandomDelay } from "#extra/packetRandom"

export default class BlobsSystem extends BaseModule {
    #signal
    constructor (bot, signal) {
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

        for (const h of blob_hashes) {
            this.have.push(parseBigInt(h))
        }
    }

    getHashesFromSubChunkPacket(p) {
        for (const entry of p.entries) {
            const hash = entry.blob_id
            if (!hash) return
            if (this.hashMap.hasSubChunkData(hash)) have.push(parseBigInt(hash))
            else missing.add(parseBigInt(h))
    }
    }

    blobsRequesterLoop() {
        const bot = this.bot
        const missing = this.missing
        const have = this.have
        let lastSend = new Date()
        let sizeToSend = getClampedRandom(80, 60, 100, 0.3)
        let randomDelay = getRandomDelay(300, 0.1)

        const sendHashes = () => {
            const misses = missing.size
            const haves = have.length
            const missingArr = Array.from(missing, (v) => BigIntToLu64(v))
            const haveArr = have.map((v) => BigIntToLu64(v))

            bot.packets.queue('client_cache_blob_status', {
                misses,
                haves,
                missing: missingArr,
                have: haveArr
            })
            
            this.have = []
            missing.clear()
            lastSend = new Date()
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
            if (missing.size + have.length >= sizeToSend) {
                sendHashes()
                return
            }
            
            const haveData = missing.size > 0 || have.length > 0
            const timeout = Date.now() - lastSend >= randomDelay
            if (haveData && timeout) {
                sendHashes()
                randomDelay = getRandomDelay(300, 0.1)
            }
            
            this.#signal.addEventListener('abort', () => clearInterval(chunkSaverloop), { once: true });
        }, 350);
    }
}