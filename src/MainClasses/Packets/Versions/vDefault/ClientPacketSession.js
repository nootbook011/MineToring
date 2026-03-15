export default class ClientPacketSession {
    /**
     * @type {import("#Base/BedrockClient/BaseBedrockBot").BaseBedrockBot}
     */
    bot
    #clientGetter

    /**
     * @returns {import("#Base/BedrockClient/CustomPClient").CustomPClient}
     */
    get client() { return this.#clientGetter() }

    constructor(BedrockBot, client) {
        this.bot = BedrockBot
        this.#clientGetter = client
    }

    connectHandler() {
        
    }

    disconnectHandler() {
        
    }
}