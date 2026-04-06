import { BedrockEngineStorage } from "#Storage/BedrockEngineStorage";
import { BedrockDimension } from "./BaseBedrockDimension.js"

import { PrismarineAdapter } from '#Main/PrismarineAdapters/PrismarineAdapter'
import { safeUpdate } from "#extra/extraFunctions";

const engList = {
    adapter: 'ValidateAdapter',
    blobs: 'BlobsManager',
    ProtocolValidator: 'ProtocolValidator'
}

export class BedrockWorld extends BedrockEngineStorage {
    #metadata = {}
    #dimensions = {}
    #inited = false

    version
    get #Protocol() { return this.getEngine(engList.ProtocolValidator)?.Protocol }
    get #db() { return this.#Protocol.DataBase }
    
    constructor(version, engines = {}) {
        super({}, { safeTypes: false })
        
        this.version = version
        
        try {
            this.#initEngines(engines, version)
        } catch(e) {
            console.error(`Unexpected error during engines initialization: ${e.message}, please check your engines correctly!`)
            throw e
        }
    }
    
    #initEngines(engines, version) {
        const ProtocolValid = engines?.ProtocolValidator
        if (!ProtocolValid?.Protocol) {
            console.error("Asynchronous Protocol initialization mismatch. Synchronous constructors cannot initialize an async ProtocolValidator." + "\nPlease pass the pre-initialized ProtocolValidator instance via the 'engines' object.")
            throw new TypeError('Protocol not initialize')
        }
        
        engines = {
            ValidateAdapter: engines.ValidateAdapter || new PrismarineAdapter(version),
            BlobsManager: engines.BlobsManager,
            ProtocolValidator: ProtocolValid
        }

        this._setDefaultEngines(engines)
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
        const BlobsManager = this.getEngine(engList.blobs)
        if (!BlobsManager || this.blobsManager) return
        
        this.blobsManager = new BlobsManager()
    }

    #buildFromStartgame(p, parser) {
        const adapter = this.getEngine(engList.adapter)
        adapter.setStartgamePacket(p)
        
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
        const engines = {
            ValidateAdapter: this.getEngine(engList.adapter),
            ProtocolValidator: this.getEngine(engList.ProtocolValidator),
            BlobsManager: this.blobsManager,
        }

        return new BedrockDimension(engines)
    }

    get isInited() {
        return this.#inited
    }

    setMetadata(metadataInput) {
        safeUpdate(this.metadata, metadataInput, this.#db.getParser(this.#db.keys.world).metadata())
    }

    get metadata() {
        return this.#metadata
    }
}