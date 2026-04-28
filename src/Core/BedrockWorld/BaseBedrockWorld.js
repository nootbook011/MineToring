import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockDimension } from "./BaseBedrockDimension.js"
import { BedrockEntities } from "#Storage/BaseBedrockEntities"
import { EventEmitter } from 'node:events'

import { PrismarineAdapter } from '#Main/PrismarineAdapters/PrismarineAdapter'
import { recurseUpdate } from "#extra/extraFunctions";
import { BedrockProtocol, ProtocolLoader } from "#Main/Packets/ProtocolLoader";

export class BedrockWorld extends BedrockPlugins {
    #protocol
    #metadata = {}
    #dimensions = {}
    #entities
    #inited = false
    #events = new EventEmitter()
    get events() { return this.#events }

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

    version
    get #db() { return this.#protocol.parsers }
    get isInited() { return this.#inited }
    get entities() { return this.#entities }
    get players() { return this.entities.players }

    constructor(version, plugins = {}) {
        super()
        this.version = version
        this.#entities = new BedrockEntities()

        try {
            this.#initPlugins(plugins, version)
        } catch (e) {
            console.error(`Unexpected error during plugins initialization: ${e.message}, please check your plugins correctly!`)
            throw e
        }
    }

    async initProtocol(protocol = undefined, autoInit = true) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else if (autoInit) this.#protocol = await ProtocolLoader.getProtocol(this.version)
        else return
    }

    #initPlugins(plugins, version) {
        Object.assign(plugins, {
            ValidateAdapter: plugins.ValidateAdapter || new PrismarineAdapter(version),
        })

        this.loadPlugins(plugins)
    }

    /**
     * Creates the world, it will initialize the blobs manager and parse the start game packet if provided, if not, it will just initialize the metadata with default values.
     * @param {Object} startGame 
     */
    create(startGame = undefined) {
        if (!this.#protocol) throw new TypeError(`Initialize protocol using the async .initProtocol() method first.`)
        const parser = this.#db.World
        parser.buildWorld(this, startGame)

        if (startGame) this.#buildFromStartgame(startGame, parser)
        else this.#metadata = parser.metadata()
        this.#inited = true
    }

    /**
     * Adds an entity packet to the world, it will automatically parse it and add to the map.
     * @param {Number} typeEntity - entity types, 0 entity, 1 player, 2 item
     * @param {object} entityPacket 
     * @returns {import('#World/bedrockObjects/BaseBedrockEntity').BedrockEntity}
     */
    addEntity(entityPacket, typeEntity = 0) {
        const parser = this.#db.Entity
        const entities = this.#entities

        const BEntity = parser.parseEntity(entityPacket, typeEntity, entities, this.events)
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

    #buildFromStartgame(p, parser) {
        const adapter = this.plugins.ValidateAdapter
        try {
            adapter.setStartgamePacket(p)
        } catch (e) {
            console.error(`adapter could not initialize start_game, ${e}`)
        }


        this.setMetadata(parser.metadata(p))
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
        const dim = new BedrockDimension(this.loadedPlugins)
        dim.initProtocol(this.#protocol, false)
        return dim
    }

    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }

    get metadata() {
        return this.#metadata
    }
}