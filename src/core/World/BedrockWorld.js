import { BedrockDimension } from "#World/BedrockDimension"
import { BedrockPlayer } from "./Objects/BedrockPlayer.js";
import { BedrockEntity } from "./Objects/BedrockEntity.js";
import { BedrockItemEntity } from "./Objects/BedrockItemEntity.js";
import { BedrockRegistry } from "#Core/Storage/BedrockRegistry";

import { BedrockPlugins } from "#Core/Storage/BedrockPlugins";
import { BedrockEntities } from "../Storage/Maps/BedrockEntities.js"
import { EventEmitter } from 'node:events'
import { recurseUpdate, parseLu64 } from "#extra/extraFunctions";
import { V3 } from "#extra/extraWorldFunctions";
import { GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants";

export class BedrockWorld extends BedrockPlugins {
    /** @type {import("minecraft-data").IndexedData} */
    registry
    events = new EventEmitter()

    settings = {}
    gamerules = {}
    experiments = {}
    /** @type {Array<BedrockDimension>} */
    dimensions = []
    entities = new BedrockEntities()
    #created = false

    get version() { return this.registry.version.minecraftVersion }
    get isCreated() { return this.#created }
    get players() { return this.entities.players }
    get itemsEntities() { return this.entities.items }

    #time = 0
    set time(value) {
        const newTime = Number(value)
        if (isNaN(newTime)) return new TypeError(`Expected number, received: ${typeof value}`)
        this.events.emit('time', newTime, this.#time)
        this.#time = newTime
    }
    get time() { return this.#time }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
    }

    /**
     * Creates the world, it will initialize the blobs manager and parse the start game packet if provided, if not, it will just initialize the metadata with default values.
     * @param {Object} startGame 
     */
    create(startGame = undefined) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)
        
        this.setSettings({
            name: startGame?.world_name || "My World",
            difficulty: startGame?.difficulty ?? 0,
            hardcore: startGame?.hardcore,
            seed: startGame?.seed ? parseLu64(startGame.seed) : 0n,
            generator: startGame?.generator ?? 1,
            defaultGamemode: startGame?.gamemode ? GAMEMODES[startGame.gamemode] : 0,
            defaultPermissions: startGame?.permission_level ? PERMISSION_LEVELS[startGame.permission_level] : 0,
            spawnpoint: startGame?.spawn_position ?? V3(0, 0, 0),
            achievements: startGame?.achievements_disabled !== undefined ? !startGame.achievements_disabled : false,
            spawnWithMap: startGame?.map_enabled ?? false,
            bonusChest: startGame?.bonus_chest ?? false,
            commands: startGame?.enable_commands ?? false,
            eduFeatures: startGame?.edu_features_enabled ?? false,
            rpRequired: startGame?.is_texturepacks_required ?? false,
            isMultiplayer: startGame?.is_multiplayer ?? false,
            chunkTickRange: startGame?.server_chunk_tick_range ?? 4,
        })
        this.time = startGame?.day_cycle_stop_time ?? 0
        
        
        if (startGame?.gamerules) this.updateGamerules(startGame.gamerules)
        for (const experiment of startGame?.experiments ?? []) {
            this.experiments[experiment.name] = experiment.enabled
        }

        if (startGame) this.registry.handleStartGame(startGame)

        this.#created = true
    }

    updateGamerules(gamerules) {
        const old = structuredClone(this.gamerules)

        for (const gamerule of gamerules ?? []) {
            const { name, value } = gamerule
            this.gamerules[name] = value
        }

        this.events.emit('changeGamerules', this.gamerules, old)
    }
    setSettings(settingsInput) { recurseUpdate(this.settings, settingsInput) }

    /**
     * Adds an entity packet to the world, it will automatically parse it and add to the map.
     * @param {number} typeEntity - entity types, 0 entity, 1 player, 2 item
     * @param {object} entityPacket 
     * @param {undefined} playerList - server player list, if player exist inside it, it will take the player class from there.
     * @returns {import('./Objects/BedrockEntity.js').BedrockEntity|import("./Objects/BedrockPlayer.js").BedrockPlayer}
     */
    addEntity(entityPacket, typeEntity = 0, playerList = undefined) {
        const entities = this.entities
        let BEntity

        switch (typeEntity) {
            case 0:
                BEntity = new BedrockEntity(this.registry)
                BEntity.buildFromPacket(entityPacket)
                this.events.emit('newMob', BEntity)
                break
            case 1:
                BEntity = playerList?.getPlayer(entityPacket.unique_id) ?? new BedrockPlayer(this.registry)
                BEntity.buildFromPacket(entityPacket)
                if (BEntity.gamemode === GAMEMODES.fallback) BEntity.gamemode = this.settings.defaultGamemode
                this.events.emit('newPlayer', BEntity)
                break
            case 2:
                BEntity = new BedrockItemEntity(this.registry)
                BEntity.buildFromPacket(entityPacket)
                this.events.emit('newItem', BEntity)
                break
        }

        this.events.emit('newEntity', BEntity)
        entities.setEntity(BEntity)
        return BEntity
    }

    /**
     * 
     * @param {bigint|number|string} id - runtime or unique id of entity 
     * @returns {import('./Objects/BedrockEntity.js').BedrockEntity}
     */
    getEntity(id) {
        return this.entities.getEntity(id)
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
        this.dimensions[dimensionId] ??= this.#createDimension(dimensionId)
        const dimension = this.dimensions[dimensionId]

        return dimension
    }

    #createDimension(id) {
        if (!this.registry) throw new Error(`Cannot create dimension without dependencies.`)
        const dim = new BedrockDimension(this.registry)
        dim.create(id)
        this.events.emit('dimensionCreate', dim)

        return dim
    }
}