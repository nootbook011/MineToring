import { BedrockDimension } from "#World/BedrockDimension"
import { BedrockPlayer } from "./BedrockPlayer.js";
import { BedrockEntity } from "./BedrockEntity.js";
import { BedrockItemEntity } from "./BedrockItemEntity.js";
import { BedrockRegistry } from "#Core/Storage/BedrockRegistry";

import { BedrockPlugins } from "#Core/Storage/BedrockPlugins";
import { BedrockEntities } from "../Storage/Maps/BedrockEntities.js"
import { EventEmitter } from 'node:events'
import { recurseUpdate } from "#extra/extraFunctions";
import { V3 } from "#extra/extraWorldFunctions";
import { GAMEMODES } from "#Storage/constants";

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

    #rain = false
    #thunder = false
    #time = 0

    get time() { return this.#time }
    set time(value) {
        if (!Number.isFinite(value)) throw new TypeError(`Expected number, received: ${typeof value}`)
        const newTime = Math.trunc(value)
        this.#time = newTime
        this.events.emit('time', this.#time)
    }
    get rain() { return this.#rain }
    set rain(value) {
        this.#rain = Boolean(value)
        this.events.emit('changeRain', this.#rain)
    }
    get thunder() { return this.#thunder }
    set thunder(value) {
        this.#thunder = Boolean(value)
        this.events.emit('changeThunder', this.#thunder)
    }

    constructor(registryOrVersion) {
        super()
        if (!registryOrVersion) return
        if (typeof registryOrVersion == "string") this.init(registryOrVersion)
        else this.registry = registryOrVersion
    }
    init(version) {
        this.registry = new BedrockRegistry(version)
        return this
    }

    create(settings = {}) {
        if (!this.registry) throw new TypeError(`Initialize dependencies using .init() method first.`)

        this.settings = {
            name: "My World",
            difficulty: 0,
            hardcore: false,
            seed: 0n,
            generator: 1,
            defaultGamemode: GAMEMODES.survival,
            spawnpoint: V3(0, 0, 0),
        }
        recurseUpdate(this.settings, settings, true)

        this.#created = true
        return this
    }

    setExperiments(experimentsInput) {
        const changed = recurseUpdate(this.experiments, experimentsInput)
        if (changed) this.events.emit('updateExperiments', experimentsInput)
        return changed
    }
    setGamerules(gamerulesInput) {
        const changed = recurseUpdate(this.gamerules, gamerulesInput)
        if (changed) this.events.emit('updateGamerules', gamerulesInput)
        return changed
    }
    setSettings(settingsInput) {
        const changed = recurseUpdate(this.settings, settingsInput)
        if (changed) this.events.emit('updateSettings', settingsInput)
        return changed
    }

    addEntity(entity) {
        this.entities.setEntity(entity)

        if (entity instanceof BedrockPlayer) this.events.emit('newPlayer', entity)
        if (entity instanceof BedrockItemEntity) this.events.emit('newItem', entity)
        this.events.emit('newEntity', entity)

        return entity
    }
    despawnEntity(entity) {
        this.entities.delEntity(entity)
        entity.despawn()
        this.events.emit('entityDespawn', entity)
    }

    getEntityByRuntimeId(runtimeId) {
        return this.entities.getEntityByRuntimeId(runtimeId)
    }
    getEntityByUniqueId(uniqueId) {
        return this.entities.getEntityByUniqueId(uniqueId)
    }

    getEntity(id) {
        return this.getEntityByRuntimeId(id) ?? this.getEntityByUniqueId(id)
    }

    getPlayer(username) {
        return this.players.get(username)
    }

    /**
     * gets the dimension by its id, if the dimension does not exist, it will create a new one and return it.
     * @param {number} id 0 - overworld, 1 - nether, 2 - the end
     * @returns {BedrockDimension}
     */
    getDimension(id) {
        return this.dimensions[id] ?? this.createDimension(id)
    }

    createDimension(id) {
        const dim = new BedrockDimension(this.registry)
        dim.create(id)
        this.dimensions[id] = dim
        this.events.emit('dimensionCreate', dim)

        return dim
    }
}