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

    have = new Set()
    missing = new Set()
    get hashMap() { return this.bot.world.blobsManager }

    getHashesFromChunkPacket(p) {
        // in 1.21.50 - official client does not request data from level chunk packet
            const blob_hashes = p?.blobs?.hashes
            if (!blob_hashes) return

            for (const h of blob_hashes) {
                this.have.add(parseBigInt(h))
            }
    }

    getHashesFromSubChunkPacket(p) {
        for (const entry of p.entries) {
            const blob_hashes = entry.blob_id
        }
    }

    chunksBlobsRequesterLoop() {
        const bot = this.bot
        if (!bot.options.bot.settings.cache) return

        this.blobsStatics = {
            misses: 0,
            have: 0
        }
        const missing = this.missing
        const have = this.have
        let lastSend = new Date()

        const getHashResult = (p) => {
            const blob_hashes = p?.blobs?.hashes
            if (!blob_hashes) return
            const hashMap = bot.world.blobsManager
            if (!hashMap) throw new TypeError('Cannot work with blobs without blobsManager')

            for (const h of blob_hashes) {
                if (hashMap.hasChunkData(h)) have.add(parseBigInt(h))
                else missing.add(parseBigInt(h))
            }
        }

        const sendHashes = () => {
            const misses = missing.size
            const haves = have.size
            const missingArr = Array.from(missing, (v) => BigIntToLu64(v))
            const haveArr = Array.from(have, (v) => BigIntToLu64(v))

            bot.packets.queue('client_cache_blob_status', {
                misses,
                haves,
                missing: missingArr,
                have: haveArr
            })
            have.clear()
            missing.clear()
            lastSend = new Date()

            this.blobsStatics.misses += misses
            this.blobsStatics.have += haves
            bot.log('world', `request blobs: miss: ${misses}, have: ${haves}`)
        }

        bot.packets.on('level_chunk', (p) => {
            getHashResult(p)
            if (missing.size + have.size >= getClampedRandom(80, 60, 100, 0.3)) sendHashes()
        })

        const chunkSaverloop = setInterval(() => {
            const haveData = missing.size > 0 || have.size > 0
            const timeout = Date.now() - lastSend >= getRandomDelay(300, 0.1)
            if (haveData && timeout) sendHashes()
            this.#signal.addEventListener('abort', () => clearInterval(chunkSaverloop), { once: true });
        }, 350);
    }
}