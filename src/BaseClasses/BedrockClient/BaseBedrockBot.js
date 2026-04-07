import { CustomPClient } from './CustomPClient.js'
import { ProtocolValidator } from '#Packets/ProtocolValidator'
import { ping } from 'bedrock-protocol'
import { CURRENT_VERSION as pMaxVersion, Versions as pVersions } from 'bedrock-protocol/src/options.js';

import { BedrockEngineStorage } from "#Storage/BedrockEngineStorage";
import { Logger } from '#extra/Logger'
import { BotOptionsManager } from './Options/BotOptionsManager.js';

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
    PacketsMain: 'ClientPacketSession',
}

export class BaseBedrockBot extends BedrockEngineStorage {
    /**
     * @type {CustomPClient}
     */
    #client
    #session

    #status = botStatus.NotInitialized
    #resolves = [[], [], [], []]
    #rejects = [[], [], [], []]

    #version = pMaxVersion
    /**
     * @type {BotOptionsManager}
     */
    options

    get engList() { return structuredClone(engList) }
    /**
     * @returns {import('#Base/BedrockClient/BotPacketController').BotPacketController}
     */
    get packets() { return this.getEngine(engList.BotPacketController) }
    get Protocol() { return this.getEngine(engList.ProtocolValidator).Protocol }
    get clientPacketSession() { return this.getEngine(engList.PacketsMain) }

    get version() { return this.#version }
    get status() { return this.#status }
    static get statusList() { return botStatus }

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
        await this.#syncVersion(options)
        try {
            await this.#initEngines(engines, this.version)
        } catch (e) {
            console.error(`Unexpected error during engines initialization: ${e.message}, please check your engines correctly!`)
            throw e
        }

        this.#initBot(options)
    }

    async #syncVersion(options = this.options) {
        let serverVersion = options?.server?.version
        if (!serverVersion || typeof serverVersion !== 'string' || !pVersions[serverVersion]) {
            console.warn(`Unsuported version by bedrock-protocol, automatically replaced`)

            try {
                const pingData = (await this.ping(options))
                if (pVersions[pingData.version]) this.#version = pingData.version
                else this.#version = Object.keys(pVersions).find(key => pVersions[key] === Number(pingData.protocol))
            } catch (e) { }

            options.server.version = this.version
            return
        }

        this.#version = serverVersion
    }

    async #initEngines(engines, version) {
        const LoggerEng = engines.Logger || new Logger(0)
        const ProtocolValid = engines?.ProtocolValidator || new ProtocolValidator(version)

        if (!ProtocolValid?.Protocol) {
            try {
                await ProtocolValid.init()
                this.log('Protocol', `Protocol successfully initialized, version: ${version}`, 0, LoggerEng)
            } catch (e) {
                throw e
            }
        }

        this.#initPlugins(engines.plugins)
        const clientGetter = () => this.#client
        engines = {
            Logger: LoggerEng,
            BotPacketController: engines.BotPacketController || new ProtocolValid.Protocol.BotPacketController(clientGetter),
            ProtocolValidator: ProtocolValid,
            ClientPacketSession: engines.ClientPacketSession || new ProtocolValid.Protocol.ClientPacketSession(this, clientGetter),
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

        if (!this.version) this.#version = Client.options?.version
        this.#client = Client
    }

    #initClient() {
        try {
            this.#statusWorker()
        } catch (e) {
            this?.log('error', `Unexpected error when starting statusWorker: ${e.message}`, 4)
            throw e
        }

        try {
            this.#client.init()
        } catch (e) {
            this?.log('error', `Unexpected error during client initialization: ${e.message}, please check your options correctly!`, 4)
            throw e
        }
    }

    // ----- Main Bot -----
    #statusWorker() {
        const Client = this.#client

        const action = (key, resOrRej = true, payload = undefined) => {
            const queue = this.#resolves[key]
            const errorQueue = this.#rejects[key]
            while (queue.length > 0) {
                const res = queue.shift()
                const rej = errorQueue.shift()
                if (resOrRej) res(payload)
                else rej(payload)
            }
        }

        const changeStatus = (s, resolveKey) => {
            this.#status = s
            this?.log("debug", `Status changed: ${s}`)
            if (resolveKey !== undefined && resolveKey !== null) action(resolveKey)
        }

        Client.on("connect_allowed", () => { changeStatus(botStatus.Disconnected, botStatus.NotInitialized) })

        Client.on("session", () => { changeStatus(botStatus.Connecting, botStatus.Connecting) })

        Client.on("spawn", () => { changeStatus(botStatus.Spawned, botStatus.Spawned) })

        Client.on('kick', () => {
            this.disconnect()
        })

        Client.on("close", () => {
            changeStatus(botStatus.Disconnected, botStatus.Disconnected)
            const rejs = this.#rejects
            const { Connecting: c, Spawned: s } = botStatus

            if (rejs[c].length) action(c, false, new Error('Closed'))
            if (rejs[s].length) action(s, false, new Error('Closed'))
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

        return new Promise((resolve, reject) => {
            this.#resolves[key].push(resolve)
            this.#rejects[key].push(reject)
        })
    }
    async waitUntilInit() {
        const tester = this.#status >= botStatus.Disconnected
        return await this.#waitUntilBuilder(tester, botStatus.NotInitialized)
    }
    async waitUntilConnect() {
        const tester = this.#status >= botStatus.Connecting
        return await this.#waitUntilBuilder(tester, botStatus.Connecting)
    }
    async waitUntilDisconnect() {
        const tester = this.#status <= botStatus.Disconnected
        return await this.#waitUntilBuilder(tester, botStatus.Disconnected)
    }
    async waitUntilSpawn() {
        const tester = this.#status === botStatus.Spawned
        return await this.#waitUntilBuilder(tester, botStatus.Spawned)
    }

    /**
     * Connect client to target server
     */
    async connect() {
        const client = this.#client
        if (this.#status === botStatus.NotInitialized) await this.waitUntilInit()
        if (this.options.network.pingBeforeConnect) {
            try {
                await this.ping()
            } catch(e) {
                this.log(`error`, `Server did not respond to ping request from bot, please check correct host and port of target server.`)
                throw e
            }
        }
        if (!client.isInit) this.#initClient()

        client.connect()
        if (!this.#client.session.isCustom) this.#session = this.#client.session

        this.clientPacketSession.connectHandler()
    }

    /**
     * Disconnect client from target server
     */
    disconnect() {
        this.clientPacketSession.disconnectHandler()
        if (this.status !== botStatus.Disconnected) {
            this.#client.disconnect()
        }
        this.#createNewClient()
    }

    async ping(options = this.options) {
        const { host, port } = options.server
        return ping({ host, port })
    }
}