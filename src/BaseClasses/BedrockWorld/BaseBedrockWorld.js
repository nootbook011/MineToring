import { BedrockEngineStorage } from "#Storage/BedrockEngineStorage";
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
        this.#metadata = this.#db.getMetadata(this.#db.keys.world)
        if (startGame) this.#buildFromStartGame(startGame)
    }

    #buildFromStartGame(startGamePacket) {
        const adapter = this.getEngine(engList.adapter)
        adapter.setStartgamePacket(startGamePacket)
        this.setupEngines({
            ValidateAdapter: adapter
        })
        
        // TODO: Обработка ошибок протокола
        const startgameParser = this.#Protocol?.Parsers?.startGamePacket
        const newMetadata = startgameParser.toWorldMetadata(startGamePacket)
        this.setMetadata(newMetadata)
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