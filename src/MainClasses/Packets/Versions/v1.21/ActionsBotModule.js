import { BaseModule } from '#Storage/moduleBase'

export default class ActionsModule extends BaseModule {
    constructor(getterClient) {
        super(getterClient)
    }
    
    sendMessage(messageText) {
        const bot = this._getClient
        bot.packets.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: bot.options.client.username,
            xuid: '',
            platform_chat_id: '',
            filtered_message: '',
            message: messageText
        })
        bot.log('actions', `Message send with data "${messageText}"`, 0)
    }
}