export class BaseModule {
    /**
     * @type {import("#lib/Client/BedrockBot").BedrockBot}
     */
    bot

    constructor(bot) {
        this.bot = bot
    }
}

export { BaseModule as BasePlugin }