import { calculateTotalChunks } from "#extra/extraWorldFunctions"
import { getPercent, sleep } from "#extra/extraFunctions"
import { ClosedError } from "#extra/errors"
import { GAMEMODES } from "#extra/extraConstants"
import { BasePlugin } from "#Storage/moduleBase"
import { PacketHandler } from "./packetHandler.js"
import { getClampedRandom } from "#extra/packetRandom"

export class ClientPacketSession extends BasePlugin {
    get client() { return this.bot.client }

    async startPacketSession() {
        const packetHandler = this.bot.plugins.packetHandler ?? this.bot.loadPlugin(PacketHandler)

        // Phase 1: connecting
        await this.startConnecting()

        // Phase 2: loading, server is now sending game packets.
        await this.startSpawning(packetHandler)
    }

    async startConnecting() {
        const client = this.bot.client
        const settings = this.bot.options.client.settings

        client.on('packet_violation_warning', (p) => {
            this.bot.log('protocol', `Protocol error: ${JSON.stringify(p, null, 2)}`, 3)
        })

        client.on('kick', (p) => {
            this.bot.log(`server`, `Server requested ${p.hide_disconnect_reason ? 'silent disconnect' : `disconnect by reason ${p.reason}`}: ${p.message || 'No message'}`, 1)
        })

        client.once('resource_packs_info', (_) => {
            client.write('client_cache_status', { enabled: settings.cache ?? false })

            client.once('resource_pack_stack', (p) => {
                client.write('resource_pack_client_response', {
                    response_status: 'completed',
                    resourcepackids: []
                })
            })
            client.write('resource_pack_client_response', {
                response_status: 'have_all_packs',
                resourcepackids: []
            })
        })
    }

    async startSpawning(packetHandler) {
        const client = this.bot.client
        const subchunks = packetHandler.addSubChunkHandler()
        const blobs = this.bot.options.client.settings.cache ? packetHandler.addBlobsHandler() : undefined

        packetHandler.bindPackets()

        subchunks.startCollectChunks()
        blobs?.startCollectChunks()

        await sleep(getClampedRandom(700, 500, 1500, 0.3))

        client.once('chunk_radius_update', (p) => {
            if (this.bot.options.client.settings.viewDistance !== p.chunk_radius) {
                this.bot.log(`server`, `Server requested change ViewDistance: ${p.chunk_radius}`, 1)
                this.bot.options.client.settings.viewDistance = p.chunk_radius
            }
        })

        client.queue('request_chunk_radius', {
            chunk_radius: this.bot.options.client.settings.viewDistance ?? 5,
            max_radius: 28
        })
        client.queue('set_player_game_type', {
            gamemode: "fallback"
        })
        client.queue('serverbound_loading_screen', { type: 1 })

        const serverReadyPromise = new Promise((resolve, reject) => {
            const handler = (statusPacket) => {
                if (statusPacket.status === 'player_spawn') resolve()
                else client.once('play_status', handler)
            }

            client.once('play_status', handler)
            client.once('close', () => { reject(new ClosedError()) })
        })

        await serverReadyPromise
        this.bot.log('client', `First initializing complete. Starting loading phase..`, 1)

        subchunks.startRequestSubChunks()
        blobs?.startRequestBlobs()

        await this.#loadFirstChunks()

        this.client.emit('spawn')
        this.bot.log('client', 'Loading phase complete. Initializing game...', 1)
    }

    async #loadFirstChunks() {
        const client = this.bot.client
        const totalNeeded = calculateTotalChunks(this.bot.options.client.settings.viewDistance)
        let loadedChunks = 0

        await new Promise((res, rej) => {
            let inited
            let lastPercent = 0
            let loadTimeout = setTimeout(() => {
                this.bot.log('client', `Loading phase took too long, disconnecting from the server by timeout..`, 3)
                exitClean()
                rej(new ClosedError(`Loading phase timeout`))
            }, this.bot.options.config.loadingTimeout ?? 180000)
            
            const botDimension = this.bot.world.getDimension(this.bot.player.dimension)

            const exitClean = () => {
                clearTimeout(loadTimeout)
                botDimension.events.off('chunkLoaded', loading)
            }

            const loading = () => {
                const loadPercent = getPercent(totalNeeded, loadedChunks).toFixed(0)
                if (loadPercent !== lastPercent) {
                    this.bot.log('world', `load ${loadPercent}% | ${loadedChunks}/${totalNeeded}`, 0)
                    lastPercent = loadPercent
                }
                loadedChunks++

                if (loadPercent >= 100) {
                    exitClean()
                    return res()
                }

                if (!inited && loadPercent >= 30) {
                    client.write('serverbound_loading_screen', { type: 2 })
                    client.write('set_local_player_as_initialized', { runtime_entity_id: this.bot.player.runtimeId })
                    inited = true
                }

                if (loadPercent >= 50) {
                    clearTimeout(loadTimeout)
                    loadTimeout = setTimeout(() => {
                        exitClean()
                        res()
                    }, 1200)
                }
            }

            this.bot.packets.once('close', () => {
                exitClean()
                rej(new ClosedError())
            })
            botDimension.events.on('chunkLoaded', loading)
        })

        this.bot.log('world', `All ${loadedChunks} chunks loaded!`, 1);
    }
}