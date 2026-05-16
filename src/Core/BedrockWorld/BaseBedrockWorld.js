import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockDimension } from "#World/BaseBedrockDimension"
import { BedrockEntities } from "#Storage/BaseBedrockEntities"
import { EventEmitter } from 'node:events'
import { recurseUpdate } from "#extra/extraFunctions";
import { BedrockProtocol, ProtocolLoader } from "#Packets/ProtocolLoader";
import { V3 } from "#extra/extraWorldFunctions";

export class BedrockWorld extends BedrockPlugins {
    #protocol
    /**
     * @type {import("minecraft-data").IndexedData}
     */
    #registry

    #metadata = {
        name: '',
        difficulty: 0,
        seed: { world: 0n },
        generator: 1,
        players: {
            gamemode: 0,
            spawnpoint: V3(0, 0, 0),
        },
    }
    #dimensions = {}
    #entities = new BedrockEntities()
    #inited = false
    #events = new EventEmitter()
    #version= ''
    get events() { return this.#events }
    get registry() { return this.#registry }

    #time = 0
    set time(value) {
        const newTime = Number(value)
        if (isNaN(newTime)) return
        this.#events.emit('time', newTime, this.#time)
        this.#time = newTime
    }
    get time() {
        return this.#time
    }

    get version() { return this.#version }
    get #db() { return this.#protocol.parsers }
    get isInited() { return this.#inited }
    get entities() { return this.#entities }
    get players() { return this.entities.players }

    constructor(version) {
        super()
        this.#version = version
    }

    init(version = undefined, protocol = undefined, registry = undefined) {
        if (version) {
            return (async () => {
                this.#protocol = await ProtocolLoader.getProtocol(version)
                this.#registry = new this.#protocol.BedrockRegistry(version)
                this.#registry.loadRuntimeIds()
                return this
            })()
        } else {
            if (protocol instanceof BedrockProtocol) {
                this.#protocol = protocol
                this.#registry = registry
            } else {
                throw new TypeError(`Instance of BedrockProtocol class is needed for initialization.`)
            }
        }
    }

    /**
     * Creates the world, it will initialize the blobs manager and parse the start game packet if provided, if not, it will just initialize the metadata with default values.
     * @param {Object} startGame 
     */
    create(startGame = undefined) {
        if (!this.#protocol) throw new TypeError(`Initialize protocol using the async .initProtocol() method first.`)

        const parser = this.#db.World
        parser.buildWorld(this, startGame)

        if (!this.#registry) this.initRegistry()
        if (startGame) this.registry?.handleStartGame(startGame)

        this.#inited = true
    }

    /**
     * Adds an entity packet to the world, it will automatically parse it and add to the map.
     * @param {Number} typeEntity - entity types, 0 entity, 1 player, 2 item
     * @param {object} entityPacket 
     * @returns {import('#World/bedrockObjects/BaseBedrockEntity').BedrockEntity|import("#World/bedrockObjects/BaseBedrockPlayer").BedrockPlayer}
     */
    addEntity(entityPacket, typeEntity = 0, playerList = undefined) {
        const entities = this.#entities
        let BEntity

        switch(typeEntity) {
            case 0:
                BEntity = this.#db.Entity.buildEntity(entityPacket)
            break
            case 1:
                BEntity = playerList ?
                    this.#db.Player.viewPlayer(entityPacket, playerList) :
                    this.#db.Player.buildPlayer(entityPacket)
            break
            case 2:
                return
            break
        }

        this.events.emit('newEntity', typeEntity, BEntity)
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
        this.#dimensions[dimensionId] ??= this.#createDimension()
        const dimension = this.#dimensions[dimensionId]

        return dimension
    }

    #createDimension() {
        if (!this.#protocol && !this.#registry) throw new Error(`Cannot create dimension without dependencies.`)
        const dim = new BedrockDimension()
        dim.loadPlugins(this.loadedPlugins)
        dim.init(undefined, this.#protocol, this.#registry)

        return dim
    }

    get metadata() { return this.#metadata }
    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }
}