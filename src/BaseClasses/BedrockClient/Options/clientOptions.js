export const realm = {}

export const server = {
    host: '',
    port: 0,
    version: '',
    realms: realm,
    offline: ''
}

export const client = {
    username: '',
    skinData: {},
    delayedInit: false,
    autoInitPlayer: false
}

export const network = {
    protocolVersion: 0,
    connectTimeout: 0,
    followPort: false,
}

export const compression = {
    compressionAlgorithm: "",
    compressionLevel: 0,
    compressionThreshold: 0
}

export const raknet = {
    useNativeRaknet: false,
    raknetBackend: "",
    useRaknetWorkers: false
}

export const other = {
    conLog: false
}

export default {
    ...server,
    ...client,
    ...network,
    ...compression,
    ...raknet,
    ...other
}