export default class ClientPacketSession {
    /**
     * @type {import("#Base/BedrockClient/BaseBedrockBot").BaseBedrockBot}
     */
    bot

    get client() { return this.bot.client }

    constructor(BedrockBot) {
        this.bot = BedrockBot
    }

    connectHandler() {
        
    }

    disconnectHandler() {
        
    }
}