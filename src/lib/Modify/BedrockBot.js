import { BedrockWorld as World } from '#World/BaseBedrockWorld'
import { BedrockServer as Server } from '#Server/BaseBedrockServer'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { BedrockBlobsManager } from "#Storage/Maps/BedrockBlobsManager"
import { Logger } from '#extra/Logger'
import path from 'path'

import { ClosedError } from '#extra/errors'

export class BedrockBot extends BaseBedrockBot {
    /**
     * @type {Server}
     */
    #server

    /**
     * @type {World}
     */
    #world

    /**
     * @type {import('minecraft-data').IndexedData}
     */
    #registry

    get world() { return this.#world }
    get server() { return this.#server }
    get registry() { return this.#registry }
    
    workDir
    
    async init(options, plugins = []) {
        const { logToFile, level } = options.config?.logging
        this.loadPlugin(new Logger(
            level || 0,
            undefined,
            logToFile && botDir ? path.join(botDir, 'logs') : undefined
        ))
        await super.init(options, plugins)
        
        this.#setupConfig()
        this.#initStorage()
        this.#initModules()
    }
    
    #initStorage() {
        this.#registry = new this.protocol.BedrockRegistry(this.version)

        this.#world = new World(this.version)
        this.world.init(undefined, this.protocol, this.#registry)

        this.#server = new Server(this.version)
        this.server.initProtocol(this.protocol)

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
    
    #setupConfig () {
        const { botDir, ignoreProtocolErrors } = this.options.config
        
        if (ignoreProtocolErrors) {
            this.packets.on('error', (e) => {
                this.log('error', `Bedrock-Protocol code error: ${e}, skipped.`)
            })
        }
        
        this.workDir = botDir
        
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
        
        this.plugins.clientSession.actionsEmitter()
    }
}