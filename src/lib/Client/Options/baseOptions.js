
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
    customSkin: {
        skinPath: '',
        capePath: '',
        geometryPath: '',
        armSize: 'wide',
    },
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
    /** all packets, all logs and other bot cache saved here */
    botDir: null,
    /** delay between requesting data from server is reduced, which speeds up loading, but can cause problems if the server uses anti-bots plugins or proxy. */ 
    fastLoading: false,
    /** time in ms after how long from the start of loading phase, the bot will exit automatically if the loading is still not completed */
    loadingTimeout: 180000,
    /** If the setting is enabled, the bot will change the skin to one of the basic Minecraft characters with each new session. */
    loginWithDifferentSkins: true,
    /** Ignore all bedrock-protocol lib errors. */
    ignoreProtocolErrors: true,
    /** If true, the bot will emulate the physics of Minecraft bedrock. */
    physics: true,
    logging: {
        /** 0 - full logging, 1 - info, 2 - warns, 3 - errors, 4 - disabled */
        level: 1,
        /** if true, logging to bot Directory */
        logToFile: false,
        deeplogging: true,
    }
}

export default {
    client,
    server,
    network,
    config
}