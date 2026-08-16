export class BaseModule {
    /**
     * @type {import("#Main/Client/BedrockBot").BedrockBot}
     */
    bot

    constructor(bot) {
        this.bot = bot
    }
}

export { BaseModule as BasePlugin }