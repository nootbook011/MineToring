import { CustomPClient } from './CustomPClient.js'
import { BotPacketController } from './BotPacketController.js'
import { ProtocolValidator } from '#Packets/ProtocolValidator'

import { BedrockEngineStorage } from "#Storage/BedrockEngineStorage";
import { Logger } from '#extra/Logger'
import { BotOptionsManager } from './Options/BotOptionsManager.js';

// TODO: Сделать полноценый класс DataBase для хранения базовых конфигов и данных

const botStatus = {
    NotInitialized: 0,
    Disconnected: 1,
    Connecting: 2,
    Spawned: 3
}

const engList = {
    Logger: 'Logger',
    ProtocolValidator: 'ProtocolValidator',
    BotPacketController: 'BotPacketController',
    PacketsMain: 'PacketsMain',
}

export class BaseBedrockBot extends BedrockEngineStorage {
    /**
     * @type {CustomPClient}
     */
    #Client
    #session

    #Status = botStatus.NotInitialized
    #resolves = [null, null, null, null]
    
    // TODO: Сделать нормальный учет версий по пингу целевого сервера перед заходом
    version
    /**
     * @type {BotOptionsManager}
     */
    options
    
    get engList() { return structuredClone(engList) }
    
    get packets() { return this.getEngine(engList.BotPacketController) }
    get Protocol() { return this.getEngine(engList.ProtocolValidator).Protocol }
    get _autoPacketsManager() { return this.getEngine(engList.PacketsMain) }

    get status() { return this.#Status }
    get session() { return structuredClone(this.#session || {}) }

    /**
     * 
     * @param {BotOptionsManager} options 
     * @param {engList} engines
     */
    constructor() {
        super({}, { safeTypes: false })
    }
    
    // ----- Init Bot -----
    async init(options, engines = {}) {
        try {
            await this.#initEngines(engines, options, options?.server?.version)
        } catch(e) {
            console.error(`Unexpected error during engines initialization: ${e.message}, please check your engines correctly!`)
            throw e
        }
        this.#initBot(options)
    }
    
    async #initEngines(engines, options, version) {
        const LoggerEng = engines.Logger || new Logger(0)
        const ProtocolValid = engines?.ProtocolValidator || new ProtocolValidator(version)
        if (!ProtocolValid?.Protocol) {
            try {
                await ProtocolValid.init()
                this.log('Protocol', 'Protocol successfully initialized', 0, LoggerEng)
            } catch (e) {
                throw e
            }
        }
        this.#initPlugins(engines.plugins)
        const clientGetter = () => this.#Client
        engines = {
            Logger: LoggerEng,
            BotPacketController: engines.BotPacketController || new BotPacketController( clientGetter ),
            ProtocolValidator: ProtocolValid,
            PacketsMain: engines.PacketsMain || new ProtocolValid.Protocol.ClientPacketsHandler( this , options),
        }
        this._setDefaultEngines(engines)
    }

    #initPlugins(plugins) {
        if (!plugins) return
        if (!Array.isArray(plugins)) plugins = [plugins]

        for (const plugin of plugins) {
            this[plugin?.name] = new plugin(this)
        }
    }
    
    #initBot(options) {
        if (options instanceof BotOptionsManager) {
            this.options = options
        } else {
            this.options = new BotOptionsManager(options)
        }

        this.#session = options.client?.session || {}
        this.#createNewClient()
        this.#initClient()
    }
    
    // ----- Client -----
    #createNewClient() {
        const options = this.options

        let log = () => { }
        if (options.config?.logging?.deeplogging) log = (t, l, ll) => this?.log(t, l, ll)
        
        const Client = new CustomPClient(options.clientOptions, this.#session, log)
        
        this?.log('debug', `create new client on session pfid: ${this.#session?.pfid || Client.session?.pfid}`)
        
        if (!this.version) this.version = Client.options?.version
        this.#Client = Client
    }
    
    #initClient() {
        try {
            this.#statusWorker()
        } catch (e) {
            this?.log('error', `Unexpected error when starting statusWorker: ${e.message}`, 4)
            throw e
        }

        try {
            this.#Client.init()
        } catch (e) {
            this?.log('error', `Unexpected error during client initialization: ${e.message}, please check your options correctly!`, 4)
            throw e
        }
    }
    
    // ----- Main Bot -----
    #statusWorker() {
        const Client = this.#Client

        const resolveAction = (key) => {
            if (this.#resolves[key]) {
                this.#resolves[key]()
                this.#resolves[key] = null
            }
        }

        const changeStatus = (s, resolveKey) => {
            this.#Status = s
            this?.log("debug", `Status changed: ${s}`, 1)
            if (resolveKey !== undefined && resolveKey !== null) resolveAction(resolveKey)
        }
        Client.on("connect_allowed", () => { changeStatus(botStatus.Disconnected, botStatus.NotInitialized) })

        Client.on("session", () => { changeStatus(botStatus.Connecting, botStatus.Connecting) })

        Client.on("spawn", () => { changeStatus(botStatus.Spawned, botStatus.Spawned) })

        Client.on("close", () => {
            changeStatus(botStatus.Disconnected, botStatus.Disconnected)

            this.#resolves[botStatus.Connecting] = null
            this.#resolves[botStatus.Spawned] = null
        })
    }
    
    log(type, message, logLevel = -1, loggerEngine = undefined) {
        const logger = loggerEngine || this.getEngine(engList.Logger)

        logger.createLog(type, message, logLevel)
        logger.print()
        logger.write()
    }
    
    #waitUntilBuilder(tester, key) {
        if (tester) return Promise.resolve()

        return new Promise(resolve => {
            this.#resolves[key] = resolve
        })
    }
    async waitUntilInit() {
        const tester = this.#Status >= botStatus.Disconnected
        return await this.#waitUntilBuilder(tester, botStatus.NotInitialized)
    }
    async waitUntilConnect() {
        const tester = this.#Status >= botStatus.Connecting
        return await this.#waitUntilBuilder(tester, botStatus.Connecting)
    }
    async waitUntilDisconnect() {
        const tester = this.#Status <= botStatus.Disconnected
        return await this.#waitUntilBuilder(tester, botStatus.Disconnected)
    }
    async waitUntilSpawn() {
        const tester = this.#Status === botStatus.Spawned
        return await this.#waitUntilBuilder(tester, botStatus.Spawned)
    }

    /**
     * Connect client to target server
     */
    async connect() {
        const client = this.#Client
        if (this.#Status === botStatus.NotInitialized) await this.waitUntilInit()
        
        if (!client.isInit) this.#initClient()
        
        client.connect()
        if (!this.#Client.session.isCustom) this.#session = this.#Client.session
        
        this._autoPacketsManager.connectHandler()
    }
    
    async disconnect() {
        if (this.status < botStatus.Spawned) await this.waitUntilSpawn()
        
        this.#Client.disconnect()
        this.#createNewClient()
    }
}