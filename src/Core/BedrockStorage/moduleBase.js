export class BaseModule {
    /**
     * @type {import("#Base/BedrockClient/BaseBedrockBot").BaseBedrockBot}
     */
    bot

    constructor(bot) {
        this.bot = bot
    }
}

export { BaseModule as BasePlugin }