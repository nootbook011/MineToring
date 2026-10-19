import { BedrockWorld } from '#World/BedrockWorld'
import { BedrockServer } from '#World/BedrockServer'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { ActionsModule } from '#Modules/ActionsModule'
import { PhysicsModule } from "#Modules/PhysicsModule"
import { ClientPacketSession } from "#Modules/ClientPacketSession"
import { Logger } from '#extra/Logger'
import path from 'path'
import { ClosedError } from '#extra/errors'


export class BedrockBot extends BaseBedrockBot {
    /** @type {BedrockServer} */
    #server

    /** @type {BedrockWorld} */
    #world

    /** @type {import("#World/Objects/BedrockPlayer").BedrockPlayer} */
    player

    /** @type {ActionsModule} */
    actions

    get world() { return this.#world }
    get server() { return this.#server }
    
    workDir
    
    async init(options, plugins = []) {
        const { botDir, logging } = options.config
        this.loadPlugin(new Logger(
            logging.level || 0,
            undefined,
            botDir
        ))
        await super.init(options, plugins)
        
        this.#setupConfig()
        this.#initStorage()
        this.#initModules()
    }
    
    #initStorage() {
        const { offline, host, port } = this.options.server

        this.#world = new BedrockWorld(this.version, this.registry)
        this.#server = new BedrockServer(this.version, offline, host, port, this.registry)
    }
    
    #initModules() {
        const plugins = [ActionsModule, ClientPacketSession]
        
        this.loadPlugins(plugins)
        if (this.options.config.physics) this.loadPlugin(PhysicsModule)
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
        if (this.options.config.physics) this.plugins.physics.addPhysicsListeners()
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