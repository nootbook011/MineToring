import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockDimension } from "./BaseBedrockDimension.js"
import { EventEmitter } from 'node:events'

import { PrismarineAdapter } from '#Main/PrismarineAdapters/PrismarineAdapter'
import { recurseUpdate } from "#extra/extraFunctions";
import { BedrockProtocol, ProtocolLoader } from "#Main/Packets/ProtocolLoader";

export class BedrockWorld extends BedrockPlugins {
    #protocol
    #metadata = {}
    #dimensions = {}
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

    constructor(version, plugins = {}) {
        super()
        this.version = version

        try {
            this.#initPlugins(plugins, version)
        } catch (e) {
            console.error(`Unexpected error during plugins initialization: ${e.message}, please check your plugins correctly!`)
            throw e
        }
    }

    async initProtocol(protocol = undefined) {
        if (protocol || protocol instanceof BedrockProtocol) this.#protocol = protocol
        else this.#protocol = await ProtocolLoader.getProtocol(this.version)
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
        const parser = this.#db.world
        this.#initBlobs()

        parser.buildWorld(this, startGame)

        if (startGame) this.#buildFromStartgame(startGame, parser)
        else this.#metadata = parser.metadata()
        this.#inited = true
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
        return new BedrockDimension(this.loadedPlugins)
    }

    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }

    get metadata() {
        return this.#metadata
    }
}