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
    #options = {}

    /**
    *
    * @param {baseOptions} options
    * @returns {clientOptions}
    */
    #parseOptionsToClient(options) {
        const {
            server: serverOpt,
            client: clientOpt,
            network: networkOpt,
            config: configOpt
        } = options

        const customLoginPacket = {
            ...(clientOpt?.customLoginPacket || {})
        }
        if (clientOpt?.customSkin) customLoginPacket.skinData = {...clientOpt?.customSkin}

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
        if (options?.constructor === Object) safeUpdate(this.#options, options, baseOptions)
        else options = baseOptions

        this.#options = structuredClone({...options, client: { ...bc, session: undefined }})
    }
    
    get clientOptions() { return this.#parseOptionsToClient(this.#options) }
    
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
        return this.#options.client
    }
    /**
     * @return {bs}
     */
    get server() {
        return this.#options.server
    }
    /**
     * @return {bn}
     */
    get network() {
        return this.#options.network
    }

    /**
     * @return {bcon}
     */
    get config() {
        return this.#options.config
    }

    /**
    *
    * @param {bc} v
    */
    configClient(v) {
        recurseUpdate(this.client, v, bc)

    }
    /**
    *
    * @param {bs} v
    */
    configServer(v) {
        recurseUpdate(this.server, v, bs)
    }
    /**
    *
    * @param {bn} v
    */
    configNetwork(v) {
        recurseUpdate(this.network, v, bn)
    }

    /**
     * 
     * @param {bcon} v 
     */
    configBotConfig(v) {
        recurseUpdate(this.config, v, bcon)
    }
}