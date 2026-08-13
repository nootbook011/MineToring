import baseOptions from "./baseOptions.js";
import clientOptions from "./clientOptions.js";
import {
    client as bc,
    server as bs,
    network as bn,
    config as bcon,
} from "./baseOptions.js";

import { recurseUpdate, safeUpdate } from '#extra/extraFunctions'

export class BotOptionsManager {
    #options = baseOptions

    /**
    *
    * @param {baseOptions} options
    * @returns {clientOptions}
    */
    parseOptionsToClient(options, skinData = undefined) {
        const {
            server: serverOpt,
            client: clientOpt,
            network: networkOpt,
            config: configOpt
        } = options

        const customLoginPacket = {
            ...(clientOpt.customLoginPacket ?? {})
        }
        if (skinData) Object.assign(customLoginPacket, skinData)

        return {
            ...serverOpt,
            followPort: true,
            username: clientOpt.username,
            connectTimeout: networkOpt.clientConnectTimeout,
            skinData: customLoginPacket,
            delayedInit: true,
            conLog: false,
            autoInitPlayer: !configOpt.simulateChunksLoading
        }
    }

    /**
    *
    * @param {baseOptions} options
    */
    constructor(options = undefined) {
        this.#options = safeUpdate(this.#options, options, baseOptions) ?? this.#options
    }
    
    /**
     * @return {baseOptions}
     */
    get options() {
        return this.#options
    }

    /**
     * @return {bc}
     */
    get client() {
        return this.#options.client ?? {}
    }
    /**
     * @return {bs}
     */
    get server() {
        return this.#options.server ?? {}
    }
    /**
     * @return {bn}
     */
    get network() {
        return this.#options.network ?? {}
    }

    /**
     * @return {bcon}
     */
    get config() {
        return this.#options.config ?? {}
    }

    /**
    *
    * @param {bc} v
    */
    configClient(v) {
        recurseUpdate(this.client, v)

    }
    /**
    *
    * @param {bs} v
    */
    configServer(v) {
        recurseUpdate(this.server, v)
    }
    /**
    *
    * @param {bn} v
    */
    configNetwork(v) {
        recurseUpdate(this.network, v)
    }

    /**
     * 
     * @param {bcon} v 
     */
    configBotConfig(v) {
        recurseUpdate(this.config, v)
    }
}