
export const client = {
    username: "player",
    session: {
        useVarious: false,
        uuid: "",
        pfid: "",
        xuid: "",
        devid: "",
        ssignid: "",
    },
    customSkin: {},
    customLoginPacket: {},
    settings: {
        viewDistance: 5,
        cache: true,
    },
}

export const server = {
    offline: true,
    version: "",
    host: "127.0.0.1",
    port: 19132,
}

export const network = {
    pingBeforeConnect: true,
    clientConnectTimeout: 9000,
}

export const config = {
    /**
     * all packets, all logs and other bot cache saved here
     */
    botDir: null,
    /**
     * Waiting for the main level_chunk packets to be received may increase the initialization time of the bot
     */
    simulateChunksLoading: true,
    /**
     * delay between requesting data from server is reduced, which speeds up loading, but can cause problems if the server uses anti-bots plugins or proxy.
    */ 
    fastLoading: false,
    /**
     * Ignore all bedrock-protocol lib errors.
     */
    ignoreProtocolErrors: true,
    logging: {
        level: 0, // 0 - full logging, 1 - info, 2 - warns, 3 - errors, 4 - disabled
        logToFile: false, // if true, logging to bot Directory
        deeplogging: true,
    }
}

export default {
    client,
    server,
    network,
    config
}