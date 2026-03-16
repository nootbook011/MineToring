import { calculateTotalChunks } from "#extra/extraWorldFunctions"

import { PacketRequester } from "./Packets/PacketRequester.js"
import { PacketWriter } from "./Packets/PacketWriter.js"
import baseCPS from '../vDefault/ClientPacketSession.js'

export default class ClientPacketSession extends baseCPS {
    ac
    #engines

    init() {
        this.ac = new AbortController();
        this.#engines = {
            writer: new PacketWriter(this.bot),
            requester: new PacketRequester(this.bot, this.ac.signal),
        }
        
        this.bot.log('world', 'Starting request subchunks')
        this.#engines.writer.setupPacketWriter()
        this.#engines.requester.setupPacketRequester()
    }

    async playerSimulationLoop() {
        try {
            await this.startLoadingPhase()
        } catch (err) {
            if (this.ac.signal.aborted) {
                this.bot.log('playersimulation', `Aborted: ${err.message}`)
            } else throw err
        }

    }

    async startLoadingPhase() {
        this.#loadingScreenTrigger()

        const serverReadyPromise = new Promise((resolve, reject) => {
            const handler = (statusPacket) => {
                if (statusPacket.status === 'player_spawn') {
                    this.bot.packets.off('play_status', handler)
                    resolve()
                }
            }

            this.bot.packets.on('play_status', handler)
            this.ac.signal.addEventListener('abort', () => { reject(new Error(this.ac.signal.reason)) }, { once: true })
        })

        let clientReadyPromise
        if (this.bot.options.config.simulateChunksLoading) {
            clientReadyPromise = this.#loadFirstChunks()
        } else {
            clientReadyPromise = Promise.resolve()
        }

        await Promise.all([serverReadyPromise, clientReadyPromise]);

        this.client._manualClientInGameInit()
        this.bot.log('world', 'Loading phase complete. Initializing game...');
    }

    #loadingScreenTrigger() {
        const client = this.bot.packets
        let check = Date.now()
        client.once('level_chunk', (_) => {
            client.queue('serverbound_loading_screen', { type: 1 })
            this.bot.log('playersimulation', 'Loading screen: Phase 1 (Started)')
            check = Date.now()
        })

        client.once('spawn', (_) => {
            client.queue('serverbound_loading_screen', { type: 2 })
            this.bot.log('playersimulation', `Loading screen: Phase 2 (Finished after ~${Date.now() - check}ms)`)
        })
    }

    async #loadFirstChunks() {
        const totalNeeded = calculateTotalChunks(this.bot.options.client.settings.viewDistance) + 1
        if (this.#engines.writer.writeStatics.chunksWritten >= totalNeeded) return

        await new Promise((res, rej) => {
            this.ac.signal.addEventListener('abort', () => { rej(new Error(this.ac.signal.reason)) }, { once: true })
            this.bot.packets.on('level_chunk', () => {
                this.bot.log('world', `load ${this.#engines.writer.writeStatics.chunksWritten}/${totalNeeded}`)
                if (this.#engines.writer.writeStatics.chunksWritten >= totalNeeded) res()
            })
        })

        this.bot.log('world', `All ${totalNeeded} chunks loaded!`);
    }

    // base
    connectHandler() {
        const client = this.bot.packets
        const settings = this.bot.options.client.settings

        const rpResponse = (_ = {}) => {
            client.write('resource_pack_client_response', {
                response_status: 'completed',
                resourcepackids: []
            })
        }

        client.once('resource_packs_info', (_) => {
            rpResponse()
            client.write('client_cache_status', { enabled: settings.cache ?? false })

            client.once('resource_pack_stack', rpResponse)
            client.once('level_chunk', (_) => {
                client.once('chunk_radius_updated', (p) => { settings.viewDistance = p.chunk_radius })
                client.queue('request_chunk_radius', { chunk_radius: settings.viewDistance })
            })
        })

        client.on('packet_violation_warning', (p) => {
            this.bot?.log('error', `Protocol error: ${JSON.stringify(p, null, 2)}`)
        })
    }

    disconnectHandler() {
        this.ac.abort(`Disconnected`)
    }
}

