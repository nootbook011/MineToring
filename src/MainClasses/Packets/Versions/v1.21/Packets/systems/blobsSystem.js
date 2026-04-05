import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { parseLu64, BigIntToLu64 } from "#extra/extraFunctions"
import { getRandomDelay } from "#extra/packetRandom"

export default class BlobsSystem extends BaseModule {
    #signal
    constructor(bot, signal) {
        super(bot)
        this.#signal = signal
    }

    have = new Map()
    missing = new Map()

    resetCache() {
        this.have.clear()
        this.missing.clear()
    }
    get hashMap() { return this.bot.world.blobsManager }

    getHashesFromChunkPacket(p) {
        const blob_hashes = p?.blobs?.hashes
        if (!blob_hashes) return

        for (const hash of blob_hashes) {
            if (!hash) continue
            if (this.hashMap.hasPayload(hash)) this.have.set(hash.toString(), hash)
            else this.missing.set(hash.toString(), hash)
        }
    }

    getHashesFromSubChunkPacket(p) {
        for (const entry of p.entries) {
            const hash = entry.blob_id
            if (!hash || entry.result !== 'success') continue
            if (this.hashMap.hasPayload(hash)) this.have.set(hash.toString(), hash)
            else this.missing.set(hash.toString(), hash)
        }
    }

    blobsRequesterLoop() {
        const bot = this.bot

        const sendHashes = () => {
            const misses = this.missing.size
            const haves = this.have.size

            bot.packets.queue('client_cache_blob_status', {
                misses,
                haves,
                missing: [...this.missing.values()],
                have: [...this.have.values()]
            })
            this.resetCache()
            bot.log('world', `request blobs: miss: ${misses}, have: ${haves}`)
        }

        bot.packets.on('level_chunk', (p) => {
            this.getHashesFromChunkPacket(p)
        })

        bot.packets.on('subchunk', (p) => {
            this.getHashesFromSubChunkPacket(p)
        })

        let timerId
        let nextDelay = getRandomDelay(300, 0.1)
        const runRequester = () => {
            if (this.#signal.aborted) return
            const haveData = this.missing.size > 0 || this.have.size > 0;
            if (haveData) {
                sendHashes()
                nextDelay = getRandomDelay(300, 0.1)
            } else {
                nextDelay = 350
            }
            
            timerId = setTimeout(runRequester, nextDelay)
        };

        runRequester()
        this.#signal.addEventListener('abort', () => clearTimeout(timerId), { once: true })
    }
}