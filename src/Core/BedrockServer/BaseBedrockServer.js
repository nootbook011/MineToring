import { BedrockPlayerList } from "#Base/BedrockStorage/BedrockPlayerList"
import { BedrockPlugins } from "#Base/BedrockStorage/BedrockPlugins"
import { recurseUpdate } from "#extra/extraFunctions"
import { ProtocolLoader } from "#Main/index"
import { BedrockProtocol } from "#Main/Packets/ProtocolLoader"

export class BedrockServer extends BedrockPlugins {
    #metadata = {}
    #inited = false
    #protocol
    #playerList

    get playerList() { return this.#playerList }
    get isInited() { return this.#inited }
    get #db() { return this.#protocol.parsers }

    constructor(version) {
        super()
        this.version = version
        this.#playerList = new BedrockPlayerList()
    }

    create(serverData, startGame = undefined) {
        if (!this.#protocol) throw new TypeError(`Initialize protocol using the async .initProtocol() method first.`)
        const parser = this.#db.Server
        parser.buildServer(this, startGame)

        if (startGame) this.buildFromStartgame(serverData, startGame, parser)
        else this.#metadata = parser.metadata(serverData)

        this.#inited = true
    }

    buildFromStartgame(serverData, p, parser = this.#db.Server) {
        this.setMetadata(parser.metadata(serverData, p))
    }

    buildFromPlayerlist(playerListPacket, parser = this.#db.Server) {
        parser.buildPlayerListByPacket(playerListPacket, this.#playerList)
    }

    addPlayer(BedrockPlayer) {
        this.#playerList.setPlayer(BedrockPlayer)
    }

    getPlayer(id) {
        this.#playerList.getPlayer(id)
    }

    async initProtocol(protocol = undefined, autoInit = true) {
        if (protocol instanceof BedrockProtocol) this.#protocol = protocol
        else if (autoInit) this.#protocol = await ProtocolLoader.getProtocol(this.version)
        else return
    }

    setMetadata(metadataInput) {
        recurseUpdate(this.metadata, metadataInput)
    }

    get metadata() {
        return this.#metadata
    }
}