import { calculateTotalChunks } from "#extra/extraWorldFunctions"
import { getPercent } from "#extra/extraFunctions"

import { ClientPacketSession as baseCPS } from '../vDefault/ClientPacketSession.js'
import { ClosedError } from "#extra/errors"
import { GAMEMODES } from "#extra/extraConstants"

export default class ClientPacketSession extends baseCPS {
    name = 'clientSession'

    startAllHandlers() {
        const handlers = this.bot.plugins.handlers
        handlers.worldHandler()
        handlers.startGameHandler()
        handlers.playerListHandler()
        handlers.startGamePlayerInject()
        handlers.entitiesHandler()
        handlers.entitiesActionsHandler()
        handlers.chunksHandler()
        handlers.subchunksHandler()
        handlers.blobsCacheHandler()
    }
    startAllRequestHandlers() {
        const handlers = this.bot.plugins.handlers
        handlers.startRequestSubchunks()
        handlers.startRequestBlobs()
    }
    
    async startSpawningBot() {
        this.#loadingScreenTrigger()
        this.startAllHandlers()

        const serverReadyPromise = new Promise((resolve, reject) => {
            const handler = (statusPacket) => {
                if (statusPacket.status === 'player_spawn') {
                    this.bot.packets.off('play_status', handler)
                    resolve()
                }
            }

            this.bot.packets.on('play_status', handler)
            this.bot.packets.once('close', () => { reject(new ClosedError()) })
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
        this.startAllRequestHandlers()
        await clientReadyPromise()

        this.client.emit('spawn')
        this.bot.log('world', 'Loading phase complete. Initializing game...');
    }

    #loadingScreenTrigger() {
        const client = this.bot.packets
        let check = Date.now()
        client.once('level_chunk', (_) => {
            client.queue('serverbound_loading_screen', { type: 1 })
            this.bot.log('client', 'Loading screen: Phase 1 (Started)', 0)
            check = Date.now()
        })

        client.once('set_local_player_as_initialized', (_) => {
            client.queue('serverbound_loading_screen', { type: 2 })
            this.bot.log('client', `Loading screen: Phase 2 (Finished after ~${Date.now() - check}ms)`, 0)
        })
    }

    async #loadFirstChunks() {
        const totalNeeded = calculateTotalChunks(this.bot.options.client.settings.viewDistance)
        let loadedChunks = 0
        
        await new Promise((res, rej) => {
            let inited
            let loadTimeout
            let lastPercent
            const botDimension = this.bot.world.getDimension(this.bot.player.dimension)
            
            const exitClean = () => {
                clearTimeout(loadTimeout)
                botDimension.events.off('chunkLoaded', loading)
            }
            
            const loading = () => {
                const loadPercent = getPercent(totalNeeded, loadedChunks).toFixed(0)
                if (loadPercent !== lastPercent) {
                    this.bot.log('world', `load ${loadPercent}%`, 0)
                    lastPercent = loadPercent
                }
                loadedChunks++
                
                if (loadPercent >= 100) {
                    exitClean()
                    return res()
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

            this.bot.packets.once('close', () => {
                exitClean()
                rej(new ClosedError())
            })
            botDimension.events.on('chunkLoaded', loading)
        })

        this.bot.log('world', `All ${loadedChunks} chunks loaded!`, 1);
    }

    actionsEmitter() {
        if (!this.bot.actions) return
        const packets = this.bot.packets
        const emitAction = (name, data) => this.bot.actions.events.emit(name, data)
        const actions = {
            'text': (p) => emitAction('chat', {
                type: p.type,
                from: {
                    name: p?.source_name,
                    xuid: p?.xuid,
                },
                text: p.message,
            })
        }

        for (const action in actions) {
            packets.on(action, actions[action])
        }
    }

    // base
    connectHandler() {
        const client = this.bot.packets
        const settings = this.bot.options.client.settings
        
        client.on('packet_violation_warning', (p) => {
            this.bot.log('protocol', `Protocol error: ${JSON.stringify(p, null, 2)}`, 3)
        })

        client.on('kick', (p) => {
            this.bot.log(`server`, `Server requested ${p.hide_disconnect_reason ? 'silent disconnect' : `disconnect by reason ${p.reason}`}: ${p.message || 'No message'}`, 1)
            this.bot.disconnect()
        })
        
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
                        this.bot.log(`server`, `Server requested change ViewDistance: ${p.chunk_radius}`, 1)
                        settings.viewDistance = p.chunk_radius
                    }
                })
                client.queue('request_chunk_radius', {
                    chunk_radius: settings.viewDistance,
                    max_radius: settings.viewDistance + 4 // Why + 4? idk, bedrock client do it so bot do too
                })
                client.queue('set_player_game_type', { gamemode: GAMEMODES.reverse[this.bot.player.metadata.gamemode] })
            })
        })
    }
}