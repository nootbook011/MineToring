import { BedrockPlayerList } from "#Storage/Maps/BedrockPlayerList"
import { BedrockPlugins } from "#Storage/BedrockPlugins"
import { recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from "node:events"

export class BedrockServer extends BedrockPlugins {
    #version = ''
    #settings = {}
    get version() { return this.#version }
    get settings() { return this.#settings }
    setSettings(settingsInput) { recurseUpdate(this.#settings, settingsInput) }

    #created = false
    get isCreated() { return this.#created }

    #playerList = new BedrockPlayerList()
    get playerList() { return this.#playerList }

    #events = new EventEmitter()
    get events() { return this.#events }

    /**
     * 
     * @param {string} version 
     * @param {{ offline: boolean, host: string, port: number }} serverData 
     */
    constructor(version, offline = true, host = '127.0.0.1', port = 19132, registry = undefined) {
        super(registry)
        this.setSettings({ offline, host, port })
        this.#version = version
    }

    async init() {
        await super.init(this.#version)
    }

    create(startGame = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)

        this.setSettings({
            levelId: startGame.level_id ?? "world",
            engine: startGame.engine ?? '',
            identifier: startGame.server_identifier ?? '',
            correlationId: startGame.multiplayer_correlation_id ?? '',
            blockPalleteChecksum: startGame.block_pallette_checksum ?? [0, 0],
            authority: {
                movement: startGame.movement_authority ?? '',
                blocks: startGame.server_authoritative_block_breaking ?? '',
                inventory: startGame.server_authoritative_inventory ?? '',
                soundControllByServer: startGame.server_controlled_sound ?? false,
                clientSideGeneration: startGame.client_side_generation ?? false,
            },
            lan: startGame.broadcast_to_lan ?? false,
            xboxLiveMode: startGame.xbox_live_broadcast_mode ?? 0,
            platformMode: startGame.platform_broadcast_mode ?? 0,
            chunkTickRange: startGame.server_chunk_tick_range ?? 0,
            lockedBP: startGame.has_locked_behavior_pack ?? false,
            lockedRP: startGame.has_locked_resource_pack ?? false,
            msaGamertags: startGame.msa_gamertags_only ?? false,
            modelSkins: !startGame.persona_disabled ?? false,
            customSkins: !startGame.custom_skins_disabled ?? false,
            emoteChat: startGame.emote_chat_muted ?? false,
            chatRestriction: startGame.chat_restriction_level ?? '',
            blocksNetworkIdsHashed: startGame.block_network_ids_are_hashes ?? false,
        })
        
        if (startGame) this.registry?.handleStartGame(startGame)

        this.#created = true
    }

    addPlayer(BedrockPlayer) {
        this.#playerList.setPlayer(BedrockPlayer)
    }

    getPlayer(id) {
        return this.#playerList.getPlayer(id)
    }
}