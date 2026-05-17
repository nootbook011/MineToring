import { BedrockPlayerList } from "#Storage/Maps/BedrockPlayerList"
import { BedrockPlugins } from "#Storage/BedrockPlugins"
import { recurseUpdate } from "#extra/extraFunctions"
import { ProtocolLoader, BedrockProtocol } from "#Packets/ProtocolLoader"
import { EventEmitter } from "node:events"

export class BedrockServer extends BedrockPlugins {
    #metadata = {
        offline: true,
        host: "",
        port: 0,
    }
    #protocol
    #inited = false
    #events = new EventEmitter()
    #version = ''
    
    #playerList = new BedrockPlayerList()

    get playerList() { return this.#playerList }
    get events() { return this.#events }
    get version() { return this.#version }
    get isInited() { return this.#inited }
    get #db() { return this.#protocol.parsers }

    /**
     * 
     * @param {string} version 
     * @param {{ offline: boolean, host: string, port: number }} serverData 
     */
    constructor(version, serverData) {
        super()
        this.setMetadata(serverData)
        this.#version = version
    }

    initProtocol(protocol = undefined) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else return (async () => { this.#protocol = await ProtocolLoader.getProtocol(this.version) })()
    }

    create(startGame = undefined) {
        if (!this.#protocol) throw new TypeError(`Initialize protocol using the async .initProtocol() method first.`)

        const parser = this.#db.Server
        parser.buildServer(this, startGame)

        this.#inited = true
    }

    addPlayer(BedrockPlayer) {
        this.#playerList.setPlayer(BedrockPlayer)
    }

    getPlayer(id) {
        return this.#playerList.getPlayer(id)
    }

    get metadata() { return this.#metadata }
    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }
}