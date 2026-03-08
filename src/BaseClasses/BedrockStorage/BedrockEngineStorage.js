import { safeUpdate } from "#extra/extraFunctions"

export class BedrockEngineStorage {
    #engines
    #options
    
    constructor (defaults, options = { safeTypes: false }) {
        this.#options = options
        this._setDefaultEngines(defaults)
    }

    _setDefaultEngines(defaults) {
        this.#engines = defaults
    }

    /**
     * Setup custom engines for the bot, if not provided, default ones will be used
     * @param {object} engines - Custom engines
     */
    setupEngines(engines) {
        safeUpdate(this.#engines, engines, this.#engines, this.#options)
    }
    
    //@TODO: jsDoc
    getEngine(engineName) {
        return this.#engines[engineName]
    }

}