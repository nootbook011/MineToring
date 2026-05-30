import { BedrockPlayerList } from "#Storage/Maps/BedrockPlayerList"
import { BedrockPlugins } from "#Storage/BedrockPlugins"
import { recurseUpdate } from "#extra/extraFunctions"
import { ProtocolLoader, BedrockProtocol } from "#Packets/ProtocolLoader"
import { EventEmitter } from "node:events"

export class BedrockServer extends BedrockPlugins {
    #version = ''
    #settings = {
        offline: true,
        host: "",
        port: 0,
    }
    get version() { return this.#version }
    get settings() { return this.#settings }
    setSettings(settingsInput) { recurseUpdate(this.#settings, settingsInput) }

    #created = false
    get isCreated() { return this.#created }
    
    #playerList = new BedrockPlayerList()
    get playerList() { return this.#playerList }

    #events = new EventEmitter()
    get events() { return this.#events }

    /**
     * 
     * @param {string} version 
     * @param {{ offline: boolean, host: string, port: number }} serverData 
     */
    constructor(serverData, version, protocol = undefined, registry = undefined) {
        super(protocol, registry)
        this.setSettings(serverData)
        this.#version = version
    }

    get #db() { return this.protocol.parsers }
    async init() {
        await super.init(this.#version)
    }

    create(startGame = undefined) {
        if (!this.protocol || !this.registry) throw new TypeError(`Initialize dependencies using the async .init() method first.`)
        const parser = this.#db.Server

        parser.buildServer(this, startGame)
        if (startGame) this.registry?.handleStartGame(startGame)

        this.#created = true
    }
    
    addPlayer(BedrockPlayer) {
        this.#playerList.setPlayer(BedrockPlayer)
    }

    getPlayer(id) {
        return this.#playerList.getPlayer(id)
    }
}