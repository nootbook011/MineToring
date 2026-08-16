import { CustomPClient } from './CustomPClient.js'
import { ping } from 'bedrock-protocol'
import { Versions as pVersions } from 'bedrock-protocol/src/options.js';

import { BOTSTATES as botStatus } from '#extra/extraConstants';

import { BotPacketController } from './BotPacketController.js';
import { BedrockPlugins } from "#Storage/BedrockPlugins";
import { Logger } from '#extra/Logger'
import { BotOptionsManager } from './Options/BotOptionsManager.js';
import { PluginError } from '#extra/errors';
import { getBedrockCore } from '#lib/BedrockCoreManager';

export class BaseBedrockBot extends BedrockPlugins {
    /** @type {CustomPClient} */
    #client
    /** @type {typeof import("../../Cores/1.21/index.js")} */
    #core
    /** @type {import("minecraft-data").IndexedData} */
    #registry

    #session
    #skin

    #status = botStatus.NotInitialized
    #resolves = [[], [], [], []]
    #rejects = [[], [], [], []]

    #version
    /** @type {BotOptionsManager} */
    #options

    /** @type {BotPacketController} */
    packets

    get username() { return this.options.client.username }
    get registry() { return this.#registry }
    set registry(registry) { this.#registry = registry }
    get options() { return this.#options }
    set options(v) {
        if (v instanceof BotOptionsManager) return this.#options = v
        else return this.#options = new BotOptionsManager(v)
    }

    get version() { return this.#version }
    get status() { return this.#status }
    static get statusList() { return botStatus }

    get session() { return this.#session }
    get client() { return this.#client }
    get core() { return this.#core }
    get skin() { return this.#skin }

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
     * @param {BotOptionsManager | Object} options - Configuration options for the bot, either as a BotOptionsManager instance or a plain object.
     * @param {[]} plugins - Array with custom plugins
     * @returns {Promise<void>}
     */
    async init(options = new BotOptionsManager(), plugins = []) {
        this.options = options
        await this.#syncVersion()
        await this.#initBedrockCore()

        try {
            this.#registry = new this.#core.BedrockRegistry(this.#version)
        } catch (e) {
            this.log('error', `Unexpected error during dependencies initialization: ${e}, try to use another version.`)
            throw e
        }

        try {
            this.#initPlugins(plugins)
        } catch (e) {
            this.log('error', `Unexpected error during plugins initialization: ${e}.`)
            throw e
        }
        
        await this.#initClientSkin()
        this.#session = options?.client?.session || {}
        this.#createNewClient()
        this.#initClient()

        this.#changeStatus(botStatus.Disconnected, botStatus.NotInitialized)
    }

    async #initBedrockCore() {
        const ProtocolVersion = pVersions[this.#version]
        this.#core = await getBedrockCore(ProtocolVersion)
    }

    async #initClientSkin() {
        const { BedrockSkin } = this.#core
        const skinPathes = this.options.client.customSkin
        const bedrockSkin = new BedrockSkin()
        await bedrockSkin.create(
            !skinPathes.skinPath && !this.#options.config.loginWithDifferentSkins ? 'base/steve.png' : skinPathes.skinPath,
            skinPathes.capePath,
            skinPathes.geometryPath,
            skinPathes.armSize,
        )

        this.#skin = bedrockSkin
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
            } catch (e) {
                this.log('client', `Bot couldn't detect the server version automatically, try explicitly specifying the version in the options.`, 3)
                throw new Error('Server version is not defined.')
            }

            this.options.server.version = this.version
            this.log('client', `Version detected: ${this.version}`)
            return
        }

        this.#version = serverVersion
    }
    #initPlugins(plugins) {
        this.loadPlugins({
            packets: BotPacketController,
        })
        
        if (plugins) {
            if (plugins?.plugins) plugins = plugins.plugins
            if (!Array.isArray(plugins)) plugins = [plugins]
            
            for (const plugin of plugins) {
                try {
                    this.loadPlugin(plugin)
                } catch (e) {
                    if (e instanceof PluginError) {
                        this.log('plugins', `${e.message}`, 3)
                    }
                    else throw e
                }
            }
        }
    }

    // ----- Client -----
    #createNewClient() {
        const options = this.options

        let log = () => { }
        if (options.config?.logging?.deeplogging) log = (t, l, ll) => this?.log(t, l, ll)

        const clientOptions = options.parseOptionsToClient(this.#options, this.#skin.readSkinLoginFormat())
        const Client = new CustomPClient(clientOptions, this.#session, log)

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

        if (resolveKey !== undefined && resolveKey !== null) this.#statusPromiseAction(resolveKey)
    }
    #statusWorker() {
        const Client = this.#client

        Client.on("spawn", () => { this.#changeStatus(botStatus.Spawned, botStatus.Spawned) })

        Client.on("close", () => {
            if (this.status !== botStatus.Disconnected) this.disconnect()
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
    }

    /**
     * Disconnect client from target server
     */
    disconnect() {
        this.log('client', `Bot disconnecting from target server..`, 1)
        
        this.#changeStatus(botStatus.Disconnected, botStatus.Disconnected)

        this.#client.disconnect()
        this.#client.removeAllListeners()
        this.#createNewClient()
    }

    /**
     * Pings the target server to check if it's online and to retrieve its information, like motd, version or players online.
     * @returns {Promise<import("bedrock-protocol").ServerAdvertisement>}
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