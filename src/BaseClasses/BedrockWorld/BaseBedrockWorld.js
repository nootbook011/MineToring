import { BedrockEngineStorage } from "#Storage/BedrockEngineStorage";
import { BedrockBlobsManager } from "#Storage/BaseBedrockBlobsManager.js"
import { BedrockDimension } from "./BaseBedrockDimension.js"

import { PrismarineAdapter } from '#Main/PrismarineAdapters/PrismarineAdapter'
import { safeUpdate } from "#extra/extraFunctions";

const engList = {
    adapter: 'ValidateAdapter',
    ProtocolValidator: 'ProtocolValidator'
}

export class BedrockWorld extends BedrockEngineStorage {
    #metadata
    #dimensions = {}

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
            ProtocolValidator: ProtocolValid
        }

        this._setDefaultEngines(engines)
    }
    
    init(startGame = undefined) {
        const parser = this.#db.getParser(this.#db.keys.world)
        
        if (startGame) this.#buildFromStartgame(startGame, parser)
        else this.#metadata = parser.metadata()

    }

    #buildFromStartgame(p, parser) {
        const adapter = this.getEngine(engList.adapter)
        adapter.setStartgamePacket(p)
        // FIX: Проверить надобность записи адаптера
        this.setupEngines({
            ValidateAdapter: adapter
        })
        this.setMetadata(parser.metadata(p))
    }

    /**
     * 
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
            ProtocolValidator: this.getEngine(engList.ProtocolValidator)
        }

        return new BedrockDimension(engines)
    }

    setMetadata(metadataInput) {
        safeUpdate(this.metadata, metadataInput, this.#db.getMetadata(this.#db.keys.world))
    }

    get metadata() {
        return this.#metadata
    }
}