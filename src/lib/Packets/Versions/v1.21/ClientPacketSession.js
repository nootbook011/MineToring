import { calculateTotalChunks } from "#extra/extraWorldFunctions"
import { getPercent } from "#extra/extraFunctions"

import { PacketRequester } from "./Packets/PacketRequester.js"
import { PacketWriter } from "./Packets/PacketWriter.js"
import { ClientPacketSession as baseCPS } from '../vDefault/ClientPacketSession.js'
import entityParser from "./Parsers/entity.js"

export default class ClientPacketSession extends baseCPS {
    ac
    #engines

    init() {
        this.ac = new AbortController()
        this.loadedChunks = 0
        this.#engines = {
            writer: new PacketWriter(this.bot),
            requester: new PacketRequester(this.bot, this.ac.signal),
        }

        this.#engines.writer.setupPacketWriter()
        this.#engines.requester.startCollectData()
    }

    packetsHandlers() {
        this.bot.packets.on('start_game', (p) => {
            this.bot.player = entityParser.buildPlayerFromStartgame(p, this.bot)
        })

        this.bot.packets.on('packet_violation_warning', (p) => {
            this.bot?.log('error', `Protocol error: ${JSON.stringify(p, null, 2)}`)
        })

        this.bot.packets.on('kick', (p) => {
            this.bot.log(`disconnect`, `Server requested ${p.hide_disconnect_reason ? 'silent disconnect' : 'disconnect'}: ${p.message}`)
        })
    }

    async playerSimulationLoop() {
        try {
            await this.startSpawningBot()
        } catch (err) {
            if (this.ac.signal.aborted) {
                this.bot.log('playersimulation', `Aborted: ${err.message}`)
            } else throw err
        }

    }

    async startSpawningBot() {
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
            this.bot.log('world', `First initializing complete, starting loading phase`)
            clientReadyPromise = this.#loadFirstChunks.bind(this)
        } else {
            clientReadyPromise = async () => new Promise((res) => {
                this.client.emit('set_local_player_as_initialized')
                this.client.write('set_local_player_as_initialized', { runtime_entity_id: this.client.entityId })
                res()
            })
        }

        await serverReadyPromise
        this.#engines.requester.startRequestData()
        await clientReadyPromise()

        this.client.emit('spawn')
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

        client.once('set_local_player_as_initialized', (_) => {
            client.queue('serverbound_loading_screen', { type: 2 })
            this.bot.log('playersimulation', `Loading screen: Phase 2 (Finished after ~${Date.now() - check}ms)`)
        })
    }

    async #loadFirstChunks() {
        const totalNeeded = calculateTotalChunks(this.bot.options.client.settings.viewDistance)
        if (this.#engines.requester.subchunkSystem.loadedChunks >= totalNeeded) return

        await new Promise((res, rej) => {
            let inited
            let loadTimeout
            const exitClean = () => {
                clearTimeout(loadTimeout)
                this.bot.packets.off('subchunk', subchunk)
            }
            const subchunk = () => {
                const loadPercent = getPercent(totalNeeded, this.#engines.requester.subchunkSystem.loadedChunks)
                this.bot.log('world', `load ${loadPercent.toFixed(0)}%`)
                if (loadPercent >= 100) {
                    exitClean()
                    res()
                    return
                }

                if (loadPercent >= 30 && !inited) {
                    this.client.emit('set_local_player_as_initialized')
                    this.client.write('set_local_player_as_initialized', { runtime_entity_id: this.client.entityId })
                    inited = true
                }

                if (loadPercent >= 65) {
                    clearTimeout(loadTimeout)
                    loadTimeout = setTimeout(() => {
                        exitClean()
                        res()
                    }, 1200)
                }
            }

            this.ac.signal.addEventListener('abort', () => {
                exitClean()
                rej(new Error(this.ac.signal.reason))
            }, { once: true })
            this.bot.packets.on('subchunk', subchunk)
        })

        this.bot.log('world', `All ${this.#engines.requester.subchunkSystem.loadedChunks} chunks loaded!`);
    }

    // base
    connectHandler() {
        const client = this.bot.packets
        const settings = this.bot.options.client.settings
        this.packetsHandlers()

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
                client.once('chunk_radius_updated', (p) => {
                    if (settings.viewDistance !== p.chunk_radius) {
                        this.bot.log(`world`, `Server request change ViewDistance: ${p.chunk_radius}`)
                        settings.viewDistance = p.chunk_radius
                    }
                })
                client.queue('request_chunk_radius', { chunk_radius: settings.viewDistance, max_radius: settings.viewDistance + 4 })
            })
        })
    }

    disconnectHandler() {
        this.ac.abort(`Disconnected`)
    }
}

