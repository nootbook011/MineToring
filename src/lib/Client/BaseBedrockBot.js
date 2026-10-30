import { BedrockSession, CustomPClient } from './CustomPClient.js'
import { ping } from 'bedrock-protocol'
import { Versions as pVersions } from 'bedrock-protocol/src/options.js';

import { BOTSTATES as botStatus } from '#extra/extraConstants';

import { BotPacketController } from './Modules/BotPacketController.js';
import { BedrockPlugins } from "#Core/Storage/BedrockPlugins";
import { Logger } from '#lib/Client/Modules/Logger'
import { BotOptionsManager } from './Options/BotOptionsManager.js';
import { ClosedError, PluginError } from '#extra/errors';
import { BedrockRegistry } from '#Core/Storage/BedrockRegistry';
import { BedrockSkin } from "#Storage/BedrockSkin"

export class BaseBedrockBot extends BedrockPlugins {
    /** @type {CustomPClient} */
    client
    /** @type {import("minecraft-data").IndexedData} */
    registry

    /** @type {BedrockSession} */
    session
    skin

    status = botStatus.NotInitialized
    #resolves = [[], [], []]
    #rejects = [[], [], []]

    version
    /** @type {BotOptionsManager} */
    #options

    /** @type {BotPacketController} */
    packets

    customLoginPacket = {}

    get username() { return this.options.client.username }
    get options() { return this.#options }
    set options(v) {
        if (v instanceof BotOptionsManager) this.#options = v
        else this.#options = new BotOptionsManager(v)
    }

    static get statusList() { return botStatus }

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

        try {
            this.registry = new BedrockRegistry(this.version)
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

        await this.initClientSkin()
        this.session = new BedrockSession(options.client?.session)
        this.#createNewClient()
        this.#initClient()

        this.#changeStatus(botStatus.Disconnected)
    }

    async initClientSkin() {
        const skinPathes = this.options.client.customSkin
        this.skin = new BedrockSkin()
        await this.skin.create(
            !skinPathes.skinPath && !this.#options.config.loginWithDifferentSkins ? 'base/steve.png' : skinPathes.skinPath,
            skinPathes.capePath,
            skinPathes.geometryPath,
            skinPathes.armSize,
        )

        Object.assign(this.customLoginPacket, this.skin.readSkinLoginFormat())
    }

    async #syncVersion() {
        let serverVersion = this.options?.server?.version
        if (!serverVersion || typeof serverVersion !== 'string' || !pVersions[serverVersion]) {
            if (serverVersion) this.log('protocol', `Unsuported version by bedrock-protocol: ${serverVersion}, automatically replaced`, 2)

            try {
                const pingData = await this.ping()
                if (!pingData) throw new Error()
                if (pVersions[pingData.version]) this.version = pingData.version
                else this.version = Object.keys(pVersions).find(key => pVersions[key] === Number(pingData.protocol))
            } catch (e) {
                this.log('client', `Bot couldn't detect the server version automatically, try explicitly specifying the version in the options.`, 3)
                throw new Error('Server version is not defined.')
            }

            this.options.server.version = this.version
            this.log('client', `Version detected: ${this.version}`)
            return
        }

        this.version = serverVersion
    }
    #initPlugins(plugins) {
        this.loadPlugins([BotPacketController])

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

        const clientOptions = options.parseOptionsToClient(this.#options, this.customLoginPacket)
        const Client = new CustomPClient(clientOptions, this.session)

        this.log('client', `Create new client on session pfid: ${this.session?.pfid || Client.session?.pfid}`, 0)

        this.client = Client
    }

    #initClient() {
        try {
            this.#statusWorker()
        } catch (e) {
            this.log('error', `Unexpected error when starting statusWorker: ${e.message}`)
            throw e
        }

        try {
            this.client.init()
        } catch (e) {
            this.log('error', `Unexpected error during client initialization: ${e.message}, please check your options correctly!`)
            throw e
        }
    }

    // ----- Main Bot -----
    #statusPromiseAction(key, resolve = true, payload = undefined) {
        const queue = this.#resolves[key]
        const errorQueue = this.#rejects[key]
        if (!queue || !errorQueue) return
        
        while (queue.length > 0) {
            const res = queue.shift()
            const rej = errorQueue.shift()
            if (resolve) res(payload)
            else rej(payload)
        }
    }
    #changeStatus(s) {
        if (this.status == s) return
        this.status = s
        this.log("client", `Status changed: ${s}`, 0)
        this.#statusPromiseAction(s)
    }
    #statusWorker() {
        const Client = this.client

        Client.on("spawn", () => { this.#changeStatus(botStatus.Spawned) })

        Client.on("close", () => {
            if (this.status !== botStatus.Disconnected) this.disconnect()
            const rejs = this.#rejects
            const { Connecting: c, Spawned: s } = botStatus

            if (rejs[c].length) this.#statusPromiseAction(c, false, new ClosedError())
            if (rejs[s].length) this.#statusPromiseAction(s, false, new ClosedError())
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
        const logger = this.plugins.logger ?? this.loadPlugin(Logger)

        logger.createLog(type, message, logLevel)
        logger.print()
        logger.write()
    }

    #waitUntilBuilder(key) {
        return new Promise((resolve, reject) => {
            this.#resolves[key].push(resolve)
            this.#rejects[key].push(reject)
        })
    }

    async waitUntilDisconnect() {
        if(this.status <= botStatus.Disconnected) return Promise.resolve()
        return this.#waitUntilBuilder(botStatus.Disconnected)
    }
    async waitUntilConnect() {
        if (this.status >= botStatus.Connecting) return Promise.resolve()
        return this.#waitUntilBuilder(botStatus.Connecting)
    }
    async waitUntilSpawn() {
        if (this.status >= botStatus.Spawned) return Promise.resolve()
        return this.#waitUntilBuilder(botStatus.Spawned)
    }

    /**
     * Connect client to target server
     */
    async connect() {
        if (this.status === botStatus.NotInitialized) throw new TypeError(`Initialize dependencies using .init() method first.`)
        if (this.status >= botStatus.Connecting) {
            this.log('client', `Bot is already connecting to the server, second connecting will lead to errors!`, 2)
            return
        }
        
        this.log('client', `Bot connecting to target server..`, 1)
        if (this.options.network.pingBeforeConnect) {
            try {
                await this.ping()
            } catch (e) {
                this.log(`error`, `Server did not respond to ping request from bot, please check correct host and port of target server.`)
                throw e
            }
        }

        this.#changeStatus(botStatus.Connecting)
        const client = this.client
        if (!client.isInit) this.#initClient()

        client.connect()
    }

    /**
     * Disconnect client from target server
     */
    disconnect() {
        this.log('client', `Bot disconnecting from target server..`, 1)

        this.#changeStatus(botStatus.Disconnected)

        this.client.disconnect()
        this.client.removeAllListeners()
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