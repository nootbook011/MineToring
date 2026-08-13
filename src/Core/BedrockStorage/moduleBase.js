export class BaseModule {
    /**
     * @type {import("#Main/Modify/BedrockBot").BedrockBot}
     */
    bot

    constructor(bot) {
        this.bot = bot
    }
}

export { BaseModule as BasePlugin }