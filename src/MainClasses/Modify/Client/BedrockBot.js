import { World, Server } from '../../index.js'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { BedrockBlobsManager } from "#Base/BedrockStorage/BaseBedrockBlobsManager"
import { Logger } from '#extra/Logger'
import path from 'path'

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
    
    get world() { return this.#world }
    get server() { return this.#server }
    
    get actions() { return this.plugins.actions }
    
    workDir
    
    async init(options, plugins = {}) {
        await super.init(options, plugins)
        this.#setupConfig(options?.config)
        
        this.#initStorage()
        this.#initModules()
    }
    
    #initStorage() {
        const plugins = {
            ProtocolValidator: this.plugins.ProtocolValidator,
            ValidateAdapter: this.plugins.ValidateAdapter || new PrismarineAdapter(this.version),
            BlobsManager: this.options?.client?.settings?.cache ? BedrockBlobsManager : undefined
        }
        this.#world = new World(this.version, plugins)
        this.#server = new Server(this.version, plugins)
    }
    
    #initModules() {
        const actions = new this.Protocol.ActionsBotModule(this)
        this.loadPlugin(actions, 'actions')
    }
    
    #setupConfig (config) {
        const { logging, botDir } = config
        const { logToFile, level } = logging
        
        const logger = new Logger(
            level || 0,
            undefined,
            logToFile && botDir ? path.join(botDir, 'logs') : undefined
        )
        this.workDir = botDir
        this.loadPlugin(logger)
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