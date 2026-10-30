import { BedrockWorld } from '#World/BedrockWorld'
import { BedrockServer } from '#World/BedrockServer'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { ActionsModule } from '#Modules/ActionsModule'
import { PhysicsModule } from "#Modules/PhysicsModule"
import { ClientPacketSession } from "#Modules/ClientPacketSession"
import { Logger } from '#lib/Client/Modules/Logger'
import path from 'path'
import { ClosedError } from '#extra/errors'


export class BedrockBot extends BaseBedrockBot {
    /** @type {BedrockServer} */
    server

    /** @type {BedrockWorld} */
    world

    /** @type {import("#World/Objects/BedrockPlayer").BedrockPlayer} */
    player

    /** @type {ActionsModule} */
    actions

    workDir

    async init(options, plugins = []) {
        const { botDir, logging, ignoreProtocolErrors } = options.config
        const logger = this.plugins.logger ?? this.loadPlugin(Logger)
        logger.level = logging.level ?? 0
        logger.logPath = path.join(botDir, 'logs')
        this.workDir = botDir

        await super.init(options, plugins)

        if (ignoreProtocolErrors) {
            this.packets.on('error', (e) => {
                this.log('error', `Bedrock-Protocol code error: ${e}, skipped.`)
            })
        }

        this.#initStorage()
        this.#initModules()
    }

    #initStorage() {
        this.world = new BedrockWorld(this.registry)
        this.server = new BedrockServer(this.registry, this.options.server)
    }

    #initModules() {
        const plugins = [ActionsModule, ClientPacketSession]

        this.loadPlugins(plugins)
        if (this.options.config.physics) this.loadPlugin(PhysicsModule)
    }

    //OTHER
    async connect() {
        if (this.options.config.physics) this.plugins.physics.addPhysicsListeners()
        await super.connect()
        this.actions.actionsEmitter()

        try {
            await this.plugins.clientSession.startPacketSession()
        } catch (e) {
            if (e instanceof ClosedError) {
                this.log(`client`, `Bot spawning process stopped, disconnected.`, 2)
                return
            }
            throw e
        }
    }
}