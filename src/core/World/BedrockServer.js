import { BedrockPlayerList } from "../Storage/Maps/BedrockPlayerList.js"
import { BedrockPlugins } from "#Storage/BedrockPlugins"
import { recurseUpdate } from "#extra/extraFunctions"
import { EventEmitter } from "node:events"
import { BedrockRegistry } from "../Storage/BedrockRegistry.js"

export class BedrockServer extends BedrockPlugins {
    /** @type {import("minecraft-data").IndexedData} */
    registry
    events = new EventEmitter()

    settings = {}
    playerList = new BedrockPlayerList()
    #created = false

    get version() { return this.registry.version.minecraftVersion }
    get isCreated() { return this.#created }

    /**
     * 
     * @param {any} registryOrVersion 
     * @param {{ offline: boolean, host: string, port: number }} serverData 
     */
    constructor(registryOrVersion, serverData) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion

        this.setSettings(serverData)
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
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

    setSettings(settingsInput) { recurseUpdate(this.settings, settingsInput) }

    addPlayer(BedrockPlayer) {
        this.playerList.setPlayer(BedrockPlayer)
    }

    getPlayer(id) {
        return this.playerList.getPlayer(id)
    }
}