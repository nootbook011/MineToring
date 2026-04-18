import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { BedrockDimension } from "./BaseBedrockDimension.js"

import { PrismarineAdapter } from '#Main/PrismarineAdapters/PrismarineAdapter'
import { recurseUpdate, safeUpdate } from "#extra/extraFunctions";

export class BedrockWorld extends BedrockPlugins {
    #metadata = {}
    #dimensions = {}
    #inited = false

    version
    get #Protocol() { return this.plugins.ProtocolValidator.Protocol }
    get #db() { return this.#Protocol.DataBase }
    get isInited() { return this.#inited }

    constructor(version, plugins = {}) {
        super()
        this.version = version
        
        try {
            this.#initPlugins(plugins, version)
        } catch(e) {
            console.error(`Unexpected error during plugins initialization: ${e.message}, please check your plugins correctly!`)
            throw e
        }
    }
    
    #initPlugins(plugins, version) {
        const ProtocolValid = plugins?.ProtocolValidator
        if (!ProtocolValid?.Protocol) {
            console.error("Asynchronous Protocol initialization mismatch. Synchronous constructors cannot initialize an async ProtocolValidator." + "\nPlease pass the pre-initialized ProtocolValidator instance via the 'engines' object.")
            throw new TypeError('Protocol not initialize')
        }
        
        plugins = {
            ValidateAdapter: plugins.ValidateAdapter || new PrismarineAdapter(version),
            BlobsManager: plugins.BlobsManager,
            ProtocolValidator: ProtocolValid
        }

        this.loadPlugins(plugins)
    }
    
    /**
     * Creates the world, it will initialize the blobs manager and parse the start game packet if provided, if not, it will just initialize the metadata with default values.
     * @param {Object} startGame 
     */
    create(startGame = undefined) {
        const parser = this.#db.getParser(this.#db.keys.world)
        this.#initBlobs()
        
        if (startGame) this.#buildFromStartgame(startGame, parser)
        else this.#metadata = parser.metadata()
        this.#inited = true
    }

    #initBlobs() {
        const BlobsManager = this.plugins.BlobsManager
        if (!BlobsManager || this.blobsManager) return
        this.blobsManager = new BlobsManager()
    }

    #buildFromStartgame(p, parser) {
        const adapter = this.plugins.ValidateAdapter
        try {
            adapter.setStartgamePacket(p)
        } catch(e) {
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
        return new BedrockDimension({ ...this.loadedPlugins, BlobsManager: this.blobsManager })
    }

    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }

    get metadata() {
        return this.#metadata
    }
}