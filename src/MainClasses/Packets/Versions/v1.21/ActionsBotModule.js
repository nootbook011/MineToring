import { sleep } from '#extra/extraFunctions'
import { BaseModule } from '#Storage/moduleBase'

export default class ActionsModule extends BaseModule {
    constructor(getterClient) {
        super(getterClient)
    }
    
    async sendMessage(messageText) {
        const bot = this.bot
        bot.packets.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: bot.options.client.username,
            xuid: '',
            platform_chat_id: '',
            filtered_message: '',
            message: messageText
        })
        //Await for to be sure of packet sended on server
        await sleep(100)
        bot.log('actions', `Message send with data "${messageText}"`, 0)
    }
}