import baseOptions from "./baseOptions.js";
import clientOptions from "./clientOptions.js";
import {
    client as bc,
    server as bs,
    network as bn,
    config as bcon,
} from "./baseOptions.js";

import { safeUpdate } from '#extra/extraFunctions'

export class BotOptionsManager {
    #storageOptionsUnit = {}

    /**
    *
    * @param {baseOptions} options
    * @returns {clientOptions}
    */
    #parseOptionsToClient(options) {
        const {
            server: serverOpt,
            client: clientOpt,
            network: networkOpt
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
            autoInitPlayer: true
        }
    }

    /**
    *
    * @param {baseOptions} options
    */
    constructor(options = {}) {
        if (!options) safeUpdate(this.#storageOptionsUnit, options, baseOptions)
        else options = baseOptions

        this.#storageOptionsUnit = structuredClone({...options, client: { ...bc, session: undefined }})
    }
    
    get clientOptions() { return this.#parseOptionsToClient(this.#storageOptionsUnit) }
    
    /**
     * @return {baseOptions}
     */
    get options() {
        return this.#storageOptionsUnit
    }

    /**
     * @return {bc}
     */
    get client() {
        return this.#storageOptionsUnit.client
    }
    /**
     * @return {bs}
     */
    get server() {
        return this.#storageOptionsUnit.server
    }
    /**
     * @return {bn}
     */
    get network() {
        return this.#storageOptionsUnit.network
    }

    /**
     * @return {bcon}
     */
    get config() {
        return this.#storageOptionsUnit.config
    }

    /**
    *
    * @param {bc} v
    */
    configClient(v) {
        safeUpdate(this.client, v, bc)

    }
    /**
    *
    * @param {bs} v
    */
    configServer(v) {
        safeUpdate(this.server, v, bs)
    }
    /**
    *
    * @param {bn} v
    */
    configNetwork(v) {
        safeUpdate(this.network, v, bn)
    }

    /**
     * 
     * @param {bcon} v 
     */
    configBotConfig(v) {
        safeUpdate(this.config, v, bcon)
    }
}