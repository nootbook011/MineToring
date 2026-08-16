import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { Logger } from '#extra/Logger'
import path from 'path'
import { ClosedError } from '#extra/errors'

export class BedrockBot extends BaseBedrockBot {
    /** @type {import("#Cores/1.21/BedrockServer/BedrockServer").BedrockServer} */
    #server

    /** @type {import("#Cores/1.21/BedrockWorld/BedrockWorld").BedrockWorld} */
    #world

    /** @type {import("#Cores/1.21/BedrockWorld/bedrockObjects/BedrockPlayer").BedrockPlayer} */
    player

    /** @type {import("#Cores/1.21/BedrockProtocol/ActionsModule").ActionsModule} */
    actions

    get world() { return this.#world }
    get server() { return this.#server }
    
    workDir
    
    async init(options, plugins = []) {
        const { botDir, logging } = options.config
        this.loadPlugin(new Logger(
            logging.level || 0,
            undefined,
            logging.logToFile && botDir ? path.join(botDir, 'logs') : undefined
        ))
        await super.init(options, plugins)
        
        this.#setupConfig()
        this.#initStorage()
        this.#initModules()
    }
    
    #initStorage() {
        const { BedrockWorld, BedrockServer, BedrockBlobsManager } = this.core

        this.#world = new BedrockWorld(this.version, this.registry)
        const { offline, host, port } = this.options.server
        this.#server = new BedrockServer(this.version, offline, host, port, this.registry)

        if (this.options?.client?.settings?.cache) {
            const blobs = new BedrockBlobsManager()
            this.#world.loadPlugin(blobs, 'BlobsManager')
        }
    }
    
    #initModules() {
        const { ActionsModule, ClientPacketSession } = this.core

        const plugins = {
            actions: ActionsModule,
            clientSession: ClientPacketSession,
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
        this.actions.actionsEmitter()
        
        try {
            await this.plugins.clientSession.startPacketSession()
        } catch(e) {
            if (e instanceof ClosedError) {
                this.log(`client`, `Bot spawning process stopped, disconnected.`, 2)
            } else throw e
        }
    }
}