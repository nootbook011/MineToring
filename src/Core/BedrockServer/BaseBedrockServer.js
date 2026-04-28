import { BedrockEntities } from "#Base/BedrockStorage/BaseBedrockEntities"
import { BedrockPlugins } from "#Base/BedrockStorage/BedrockPlugins"
import { recurseUpdate } from "#extra/extraFunctions"
import { ProtocolLoader } from "#Main/index"
import { BedrockProtocol } from "#Main/Packets/ProtocolLoader"
import { PrismarineAdapter } from "#Main/PrismarineAdapters/PrismarineAdapter"

export class BedrockServer extends BedrockPlugins {
    #metadata = {}
    #inited = false

    get isInited() { return this.#inited }

    constructor(version) {
        this.version = version
    }

    create(serverData, startgame = undefined) {
        if (!this.#protocol) throw new TypeError(`Initialize protocol using the async .initProtocol() method first.`)
        const parser = this.#db.Server
        parser.buildServer(this, startGame)

        if (startGame) this.#buildFromStartgame(serverData, startGame, parser)
        else this.#metadata = parser.metadata(serverData)

        this.#inited = true
    }

    #buildFromStartgame(serverData, p, parser) {
        this.setMetadata(parser.metadata(serverData, p))
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