import { BedrockWorld } from '#World/BedrockWorld'
import { PlayerList } from '#lib/Storage/PlayerList'
import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { ActionsModule } from './Modules/ActionsModule.js'
import { PhysicsModule } from "./Modules/PhysicsModule.js"
import { ClientPacketSession } from "./Modules/ClientPacketSession.js"
import { Logger } from '#extra/Logger'
import path from 'path'
import { BedrockSkin } from '#Core/Storage/BedrockSkin'
import { BedrockProtocolIo } from '#protocol/BedrockProtocolIO'

export class BedrockBot extends BaseBedrockBot {
    /** @type {BedrockProtocolIo} */
    protocol

    /** @type {PlayerList} */
    playerList

    /** @type {BedrockWorld} */
    world

    /** @type {import("#World/BedrockPlayer").BedrockPlayer} */
    player
    
    /** @type {BedrockSkin} */
    skin
    
    /** @type {ActionsModule} */
    actions

    workDir

    async init(options, plugins = []) {
        const { botDir, logging, ignoreProtocolErrors } = options.config
        const logger = this.plugins.logger ?? this.loadPlugin(Logger)
        logger.level = logging?.level ?? 0
        logger.logPath = botDir ? path.join(botDir, 'logs') : undefined
        this.workDir = botDir
        
        await this.initClientSkin(options)
        await super.init(options, plugins)

        if (ignoreProtocolErrors) {
            this.client.on('error', (e) => {
                this.log('error', `Bedrock-Protocol code error: ${e}, skipped.`)
            })
        }

        this.#initStorage()
        this.#initModules()
    }

    async initClientSkin(options = this.options) {
        const skinPathes = options.client.customSkin
        this.skin = new BedrockSkin()
        await this.skin.create(
            !skinPathes.skinPath && !options.config.loginWithDifferentSkins ? 'base/steve.png' : skinPathes.skinPath,
            skinPathes.capePath,
            skinPathes.geometryPath,
            skinPathes.armSize,
        )

        Object.assign(this.customLoginPacket, this.skin.readSkinLoginFormat())
    }

    #initStorage() {
        this.world = new BedrockWorld(this.registry)
        this.playerList = new PlayerList()
        this.protocol = new BedrockProtocolIo(this)
        this.protocol.init()
    }

    #initModules() {
        const plugins = [ActionsModule, ClientPacketSession]

        this.loadPlugins(plugins)
        if (this.options.config.physics) this.loadPlugin(PhysicsModule)
    }
}