import { CustomPClient } from './CustomPClient.js'
import { ping } from 'bedrock-protocol'
import { CURRENT_VERSION as pMaxVersion, Versions as pVersions } from 'bedrock-protocol/src/options.js';

import { BOTSTATES as botStatus } from '#extra/extraConstants';

import { BotPacketController } from './Modules/BotPacketController.js';
import { BedrockProtocol, ProtocolLoader } from '#Main/Packets/ProtocolLoader';
import { BedrockPlugins, PluginError } from "#Storage/BedrockPlugins";
import { Logger } from '#extra/Logger'
import { BotOptionsManager } from './Options/BotOptionsManager.js';
import { sleep } from '#extra/extraFunctions';

export class BaseBedrockBot extends BedrockPlugins {
    /**
     * @type {CustomPClient}
     */
    #client
    #session
    /**
     * @type {BedrockProtocol}
     */
    #protocol

    #status = botStatus.NotInitialized
    #resolves = [[], [], [], []]
    #rejects = [[], [], [], []]

    #version = pMaxVersion
    /**
     * @type {BotOptionsManager}
     */
    #options
    get username() { return this.options.client.username }
    get options() { return this.#options }
    set options(v) {
        if (v instanceof BotOptionsManager) return this.#options = v
        else return this.#options = new BotOptionsManager(v)
    }

    get version() { return this.#version }
    get status() { return this.#status }
    static get statusList() { return botStatus }

    get session() { return structuredClone(this.#session || {}) }
    get client() { return this.#client }
    get protocol() { return this.#protocol }

    /**
     * Initializes the BaseBedrockBot instance. For initialization, use the async init() method instead.
     */
    constructor() {
        super()
        this.loadPlugin(new Logger(0))
    }

    // ----- Init Bot -----
    /**
     * Initializes the bot with the provided options and plugins. This method sets up the bot's version, initializes plugins, and prepares the client for connection.
     * @param {BotOptionsManager|Object} options - Configuration options for the bot, either as a BotOptionsManager instance or a plain object.
     * @param {{ plugins: BaseModule[] }} plugins - An object containing plugin instances to be loaded into the bot. The plugins should be instances of classes that extend BaseModule.
     * @returns {Promise<void>}
     */
    async init(options, plugins = {}) {
        this.options = options
        await this.#syncVersion()

        try {
            await this.initProtocol()
        } catch (e) {
            this.log('error', `Unexpected error during protocol initialization: ${e}, try to use another version.`)
            throw e
        }

        try {
            await this.#initPlugins(plugins)
        } catch (e) {
            this.log('error', `Unexpected error during plugins initialization: ${e}, please check your plugins correctly!`)
            throw e
        }

        this.#session = options?.client?.session || {}
        this.#createNewClient()
        this.#initClient()

        this.#changeStatus(botStatus.Disconnected, botStatus.NotInitialized)
    }

    async #syncVersion() {
        let serverVersion = this.options?.server?.version
        if (!serverVersion || typeof serverVersion !== 'string' || !pVersions[serverVersion]) {
            if (serverVersion) this.log('protocol', `Unsuported version by bedrock-protocol: ${serverVersion}, automatically replaced`, 2)

            try {
                const pingData = (await this.ping())
                if (!pingData) throw new Error()
                if (pVersions[pingData.version]) this.#version = pingData.version
                else this.#version = Object.keys(pVersions).find(key => pVersions[key] === Number(pingData.protocol))
            } catch (e) { }

            this.options.server.version = this.version
            return
        }

        this.#version = serverVersion
    }
    async initProtocol(protocol = undefined) {
        if (protocol || protocol instanceof BedrockProtocol) this.#protocol = protocol
        else {
            this.#protocol = await ProtocolLoader.getProtocol(this.version)
            this.log('protocol', `Protocol successfully initialized, version: ${this.protocol.version}`, 1)
        }
    }
    async #initPlugins(plugins) {
        Object.assign(plugins, {
            packets: plugins.BotPacketController || new BotPacketController(this),
            clientSession: plugins.ClientPacketSession || new this.protocol.ClientPacketSession(this),
        })

        if (plugins.plugins) {
            if (!Array.isArray(plugins.plugins)) plugins.plugins = [plugins.plugins]
            for (const plugin of plugins.plugins) {
                try {
                    this.loadPlugin(plugin)
                } catch (e) {
                    if (e instanceof PluginError) {
                        this.log('plugins', `${e.message}`, 3)
                    }
                    else throw e
                }

            }
            delete plugins.plugins
        }

        this.loadPlugins(plugins)
    }

    // ----- Client -----
    #createNewClient() {
        const options = this.options

        let log = () => { }
        if (options.config?.logging?.deeplogging) log = (t, l, ll) => this?.log(t, l, ll)

        const Client = new CustomPClient(options.clientOptions, this.#session, log)

        this.log('client', `Create new client on session pfid: ${this.#session?.pfid || Client.session?.pfid}`, 0)

        this.#client = Client
    }

    #initClient() {
        try {
            this.#statusWorker()
        } catch (e) {
            this.log('error', `Unexpected error when starting statusWorker: ${e.message}`)
            throw e
        }

        try {
            this.#client.init()
        } catch (e) {
            this.log('error', `Unexpected error during client initialization: ${e.message}, please check your options correctly!`)
            throw e
        }
    }

    // ----- Main Bot -----
    #statusPromiseAction(key, resolve = true, payload = undefined) {
        const queue = this.#resolves[key]
        const errorQueue = this.#rejects[key]
        while (queue.length > 0) {
            const res = queue.shift()
            const rej = errorQueue.shift()
            if (resolve) res(payload)
            else rej(payload)
        }
    }
    #changeStatus(s, resolveKey) {
        if (this.status === s) return
        this.#status = s
        this.log("client", `Status changed: ${s}`, 0)

        if (resolveKey === undefined && resolveKey === null) this.#statusPromiseAction(resolveKey)
    }
    #statusWorker() {
        const Client = this.#client

        Client.on("spawn", () => { this.#changeStatus(botStatus.Spawned, botStatus.Spawned) })

        Client.on("close", () => {
            this.#changeStatus(botStatus.Disconnected, botStatus.Disconnected)
            const rejs = this.#rejects
            const { Connecting: c, Spawned: s } = botStatus

            if (rejs[c].length) this.#statusPromiseAction(c, false, new Error('Closed'))
            if (rejs[s].length) this.#statusPromiseAction(s, false, new Error('Closed'))
        })
    }

    /**
     * Logs a message with the specified type and log level. The log is created using the Logger plugin, printed to the console, and written to a file if configured.
     * @param {string} type - The type of the log message (e.g., 'debug', 'warn', 'error').
     * @param {string} message - The message to log.
     * @param {number} logLevel - The log level (default is -1).
     * - 0 - debug.
     * - 1 - info.
     * - 2 - warn.
     * - 3 - error.
     */
    log(type, message, logLevel = -1) {
        const logger = this.plugins.Logger

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
        if (this.status >= botStatus.Connecting) {
            this.log('client', `Bot is already connecting to the server, second connecting will lead to errors!`, 2)
            return
        }
        if (this.status === botStatus.NotInitialized) await this.waitUntilInit()

        this.log('client', `Bot connecting to target server..`, 1)
        this.#changeStatus(botStatus.Connecting, botStatus.Connecting)
        const client = this.client
        if (!client.isInit) this.#initClient()
        if (this.options.network.pingBeforeConnect) {
            try {
                await this.ping()
            } catch (e) {
                this.log(`error`, `Server did not respond to ping request from bot, please check correct host and port of target server.`)
                throw e
            }
        }

        client.connect()
        if (!this.#client.session.isCustom) this.#session = this.#client.session

        this.plugins.clientSession.connectHandler()
    }

    /**
     * Disconnect client from target server
     */
    disconnect() {
        this.log('client', `Bot disconnecting from target server..`, 1)
        this.plugins.clientSession.disconnectHandler()
        if (this.status !== botStatus.Disconnected) {
            this.#client.disconnect()
        }
        this.#createNewClient()
    }

    /**
     * Pings the target server to check if it's online and to retrieve its version information.
     */
    async ping() {
        const { host, port } = this.options.server

        if (this.status <= botStatus.Disconnected) {
            return ping({ host, port })
        }
        else {
            return this.client.ping()
        }
    }
}