import { BedrockWorld as World } from '#Base/BedrockWorld/BaseBedrockWorld'
import { BedrockServer as Server } from '#Base/BedrockServer/BaseBedrockServer'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { BedrockBlobsManager } from "#Base/BedrockStorage/BaseBedrockBlobsManager"
import { Logger } from '#extra/Logger'
import path from 'path'

import { ClosedError } from '#extra/erros'

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
    
    workDir
    
    async init(options, plugins = {}) {
        this.#setupConfig(options?.config)
        await super.init(options, plugins)
        
        this.#initStorage()
        this.#initModules()
    }
    
    #initStorage() {
        this.#world = new World(this.version, { ValidateAdapter: this.plugins.ValidateAdapter })
        this.world.initProtocol(this.protocol)

        this.#server = new Server(this.version)

        if (this.options?.client?.settings?.cache) {
            const blobs = new BedrockBlobsManager()
            this.#world.loadPlugin(blobs, 'BlobsManager')
        }
    }
    
    #initModules() {
        const plugins = {
            actions: this.protocol.ActionsModule,
            handlers: this.protocol.HandlersManager,
        }
        
        this.loadPlugins(plugins)
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
        await super.connect()
        
        try {
            await this.plugins.clientSession.startSpawningBot()
        } catch(e) {
            if (e instanceof ClosedError) {
                this.log(`client`, `BotSpawning process stopped, disconnected.`, 2)
            } else throw e
        }
    }
}