import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockDimension, BedrockPlayer, BedrockEntity, BedrockRegistry } from "../index.js"
import { BedrockEntities } from "../BedrockStorage/Maps/BedrockEntities.js"
import { EventEmitter } from 'node:events'
import { recurseUpdate, parseLi64, parseLu64 } from "#extra/extraFunctions";
import { V3 } from "#extra/extraWorldFunctions";
import { GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants";

export class BedrockWorld extends BedrockPlugins {
    #version = ''
    /** @type {import("minecraft-data").IndexedData} */
    #registry
    #settings = {}
    #gamerules = {}
    #experiments = {}
    get version() { return this.#version }
    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }
    get settings() { return this.#settings }
    get experiments() { return this.#experiments }
    get gamerules() { return this.#gamerules }
    setSettings(settingsInput) { recurseUpdate(this.#settings, settingsInput) }

    #created = false
    get isCreated() { return this.#created }

    /** @type {Array<BedrockDimension>} */
    #dimensions = []
    #entities = new BedrockEntities()
    get dimensions() { return this.#dimensions }
    get entities() { return this.#entities }
    get players() { return this.entities.players }

    #events = new EventEmitter()
    get events() { return this.#events }

    #time = 0
    set time(value) {
        const newTime = Number(value)
        if (isNaN(newTime)) return
        this.#events.emit('time', newTime, this.#time)
        this.#time = newTime
    }
    get time() { return this.#time }

    constructor(version, registry = undefined) {
        super()
        if (registry) this.registry = registry
        this.#version = version
    }

    init() {
        this.#registry = new BedrockRegistry(this.#version)
    }

    /**
     * Creates the world, it will initialize the blobs manager and parse the start game packet if provided, if not, it will just initialize the metadata with default values.
     * @param {Object} startGame 
     */
    create(startGame = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)

        this.setSettings({
            name: startGame.world_name || "My World",
            difficulty: startGame.difficulty ?? 0,
            hardcore: startGame.hardcore,
            seed: parseLu64(startGame.seed) ?? 0n,
            generator: startGame.generator ?? 1,
            defaultGamemode: GAMEMODES[startGame.gamemode] ?? 0,
            defaultPermissions: PERMISSION_LEVELS[startGame.permission_level] ?? 0,
            spawnpoint: startGame.spawn_position ?? V3(0, 0, 0),
            achievements: !startGame.achievements_disabled ?? false,
            spawnWithMap: startGame.map_enabled ?? false,
            bonusChest: startGame.bonus_chest ?? false,
            commands: startGame.enable_commands ?? false,
            eduFeatures: startGame.edu_features_enabled ?? false,
            rpRequired: startGame.is_texturepacks_required ?? false,
            isMultiplayer: startGame.is_multiplayer ?? false,
            chunkTickRange: startGame.server_chunk_tick_range ?? 4,
        })
        this.time = startGame.day_cycle_stop_time
        
        
        this.updateGamerules(startGame.gamerules)
        for (const experiment of startGame.experiments ?? []) {
            this.experiments[experiment.name] = experiment.enabled
        }

        if (startGame) this.registry.handleStartGame(startGame)

        this.#created = true
    }

    updateGamerules(gamerules) {
        const old = structuredClone(this.#gamerules)

        for (const gamerule of gamerules ?? []) {
            const { name, value } = gamerule
            this.#gamerules[name] = value
        }

        this.events.emit('gamerules', this.object, old)
    }

    /**
     * Adds an entity packet to the world, it will automatically parse it and add to the map.
     * @param {number} typeEntity - entity types, 0 entity, 1 player, 2 item
     * @param {object} entityPacket 
     * @param {undefined} playerList - server player list, if player exist inside it, it will take the player class from there.
     * @returns {import('#Base/BedrockWorld/bedrockObjects/BedrockEntity').BedrockEntity|import("#Base/BedrockWorld/bedrockObjects/BedrockPlayer").BedrockPlayer}
     */
    addEntity(entityPacket, typeEntity = 0, playerList = undefined) {
        const entities = this.#entities
        let BEntity

        switch (typeEntity) {
            case 0:
                BEntity = new BedrockEntity(this.registry)
                BEntity.buildFromPacket(entityPacket)
                break
            case 1:
                BEntity = playerList?.getPlayer(entityPacket.unique_id) ?? new BedrockPlayer(this.registry)
                BEntity.buildFromPacket(entityPacket)
                break
            case 2:
                return
                break
        }

        if (BEntity.gamemode === 5) BEntity.gamemode = this.#settings.defaultGamemode // fallback

        this.events.emit('newEntity', BEntity, typeEntity)
        entities.setEntity(BEntity)

        return BEntity
    }

    /**
     * 
     * @param {{ runtime, unique }} ids 
     * @returns {import('#Base/BedrockWorld/bedrockObjects/BedrockEntity').BedrockEntity}
     */
    getEntity(ids) {
        return this.#entities.getEntity(ids)
    }

    getPlayer(username) {
        return this.players[username]
    }

    /**
     * gets the dimension by its id, if the dimension does not exist, it will create a new one and return it.
     * @param {number} dimensionId 0 - overworld, 1 - nether, 2 - the end
     * @returns {BedrockDimension}
     */
    getDimension(dimensionId) {
        this.#dimensions[dimensionId] ??= this.#createDimension(dimensionId)
        const dimension = this.#dimensions[dimensionId]

        return dimension
    }

    #createDimension(id) {
        if (!this.registry) throw new Error(`Cannot create dimension without dependencies.`)
        const dim = new BedrockDimension(this.registry)
        dim.create(id)
        dim.loadPlugins(this.loadedPlugins)

        return dim
    }
}