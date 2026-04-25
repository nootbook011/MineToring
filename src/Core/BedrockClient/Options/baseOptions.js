
export const client = {
    username: "player",
    session: {
        useVarious: false,
        uuid: "",
        pfid: "",
        xuid: "",
        devid: "",
        ssignid: "",
        encrypt: {
            public: "",
            private: ""
        }
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
    clientConnectTimeout: 0,
}

export const config = {
    botDir: null, // all packets, all logs and other bot cache saved here
    simulateChunksLoading: true, // Waiting for the main level_chunk packets to be received may increase the initialization time of the bot
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