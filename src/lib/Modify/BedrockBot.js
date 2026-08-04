import { BedrockWorld as World } from '#Base/BedrockWorld/BedrockWorld'
import { BedrockServer as Server } from '#Base/BedrockServer/BedrockServer'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { BedrockBlobsManager } from "#Storage/Maps/BedrockBlobsManager"
import { Logger } from '#extra/Logger'
import path from 'path'

import { ClosedError } from '#extra/errors'
import { ActionsModule } from '#Client/Modules/ActionsModule'
import { PacketHandler } from '#Client/Modules/packetHandler'
import { ClientPacketSession } from '#Client/Modules/ClientPacketSession'

export class BedrockBot extends BaseBedrockBot {
    /** @type {Server} */
    #server

    /** @type {World} */
    #world

    /** @type {import("#Base/BedrockWorld/bedrockObjects/BedrockPlayer").BedrockPlayer} */
    player

    /** @type {import("#Client/Modules/ActionsModule").ActionsModule} */
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
        this.#world = new World(this.version, this.registry)
        const { offline, host, port } = this.options.server
        this.#server = new Server(this.version, offline, host, port, this.registry)

        if (this.options?.client?.settings?.cache) {
            const blobs = new BedrockBlobsManager()
            this.#world.loadPlugin(blobs, 'BlobsManager')
        }
    }
    
    #initModules() {
        const plugins = {
            actions: ActionsModule,
            clientSession: ClientPacketSession,
            packetHandler: PacketHandler,
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
        this.plugins.actions.actionsEmitter()
        
        try {
            await this.plugins.clientSession.startPacketSession()
        } catch(e) {
            if (e instanceof ClosedError) {
                this.log(`client`, `Bot spawning process stopped, disconnected.`, 2)
            } else throw e
        }
    }
}