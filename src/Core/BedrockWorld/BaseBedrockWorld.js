import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockDimension } from "#World/BaseBedrockDimension"
import { BedrockEntities } from "#Storage/Maps/BaseBedrockEntities"
import { EventEmitter } from 'node:events'
import { recurseUpdate } from "#extra/extraFunctions";
import { V3 } from "#extra/extraWorldFunctions";
import { BedrockEntity } from "#World/bedrockObjects/BaseBedrockEntity";
import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer";

export class BedrockWorld extends BedrockPlugins {
    #version = ''
    #settings = {
        name: "My World",
        difficulty: 0,
        seed: 0n,
        generator: 1,
        defaultGamemode: 0,
        defaultPermissions: 0,
        spawnpoint: V3(0, 0, 0),
    }
    get version() { return this.#version }
    get settings() { return this.#settings }
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

    constructor(version, protocol = undefined, registry = undefined) {
        super(protocol, registry)
        this.#version = version
    }

    get #db() { return this.protocol.parsers }
    async init() {
        await super.init(this.#version)
    }

    /**
     * Creates the world, it will initialize the blobs manager and parse the start game packet if provided, if not, it will just initialize the metadata with default values.
     * @param {Object} startGame 
     */
    create(startGame = undefined) {
        if (!this.protocol || !this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        const parser = this.#db.World
        
        parser.buildWorld(this, startGame)
        if (startGame) this.registry?.handleStartGame(startGame)

        this.#created = true
    }

    /**
     * Adds an entity packet to the world, it will automatically parse it and add to the map.
     * @param {Number} typeEntity - entity types, 0 entity, 1 player, 2 item
     * @param {object} entityPacket 
     * @param {undefined} playerList - server player list, if player exist inside it, it will take the player class from there.
     * @returns {import('#World/bedrockObjects/BaseBedrockEntity').BedrockEntity|import("#World/bedrockObjects/BaseBedrockPlayer").BedrockPlayer}
     */
    addEntity(entityPacket, typeEntity = 0, playerList = undefined) {
        const entities = this.#entities
        let BEntity

        switch (typeEntity) {
            case 0:
                BEntity = new BedrockEntity(this.protocol, this.registry)
                BEntity.buildFromPacket(entityPacket)
                break
            case 1:
                BEntity = this.#db.Player.getPlayer(entityPacket, playerList)
                BEntity ??= new BedrockPlayer(this.protocol, this.registry)
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
     * @returns {import('#World/bedrockObjects/BaseBedrockEntity').BedrockEntity}
     */
    getEntity(ids) {
        return this.#entities.getEntity(ids)
    }

    getPlayer(username) {
        return this.players[username]
    }

    /**
     * gets the dimension by its id, if the dimension does not exist, it will create a new one and return it.
     * @param {Number} dimensionId 0 - overworld, 1 - nether, 2 - the end
     * @returns {BedrockDimension}
     */
    getDimension(dimensionId) {
        this.#dimensions[dimensionId] ??= this.#createDimension(dimensionId)
        const dimension = this.#dimensions[dimensionId]

        return dimension
    }

    #createDimension(id) {
        if (!this.protocol && !this.registry) throw new Error(`Cannot create dimension without dependencies.`)
        const dim = new BedrockDimension(this.protocol, this.registry)
        dim.create(id)
        dim.loadPlugins(this.loadedPlugins)

        return dim
    }
}