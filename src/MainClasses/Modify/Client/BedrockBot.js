import { World, Server } from '../../index.js'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { BedrockBlobsManager } from "#Base/BedrockStorage/BaseBedrockBlobsManager"
import { Logger } from '#extra/Logger'

import { PrismarineAdapter } from '#Main/PrismarineAdapters/PrismarineAdapter'

export class BedrockBot extends BaseBedrockBot {
    /**
     * @type {Server}
     */
    #server

    /**
     * @type {World}
     */
    #world
    
    #packetsActions
    
    get world() { return this.#world }
    get server() { return this.#server }
    
    get actions() { return this.#packetsActions }
    
    config
    workDir
    
    async init(options, engines = {}) {
        await super.init(options, engines)
        this.#setupConfig(options?.config)
        
        this.#initStorage()
        this.#initModules()
    }
    
    #initStorage() {
        const engines = {
            ProtocolValidator: this.getEngine('ProtocolValidator'),
            ValidateAdapter: this.getEngine('ValidateAdapter') || new PrismarineAdapter(this.version),
            BlobsManager: this.options?.client?.settings?.cache ? BedrockBlobsManager : undefined
        }
        this.#world = new World(this.version, engines)
        this.#server = new Server(this.version, engines)
    }
    
    #initModules() {
        const actions = new this.Protocol.ActionsBotModule(this)
        this.#packetsActions = actions
    }
    
    #setupConfig (config) {
        const { logging, botDir } = config
        const { logToFile, level } = logging
        
        const logger = new Logger(
            level || 0,
            undefined,
            logToFile ? `${botDir}\\logs` : undefined
        )
        
        const engines = {
            Logger: logger
        }
        this.config = config
        this.workDir = botDir
        
        this.setupEngines(engines)
    }
    
    
    
    //OTHER
    async connect() {
        const packetClient = this.clientPacketSession
        this.log('world', 'Starting auto-write world data')
        packetClient.init()
        await super.connect()
        packetClient.playerSimulationLoop()
    }
}