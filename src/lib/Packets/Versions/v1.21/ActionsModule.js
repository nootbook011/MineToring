import { sleep } from '#extra/extraFunctions'
import { V3 } from '#extra/extraWorldFunctions'
import { BaseModule } from '#Storage/moduleBase'
import { EventEmitter } from 'node:events'

export default class ActionsModule extends BaseModule {
    #events = new EventEmitter()
    get events() { return this.#events }

    on(e, cb) { this.events.on(e, cb) }
    once(e, cb) { this.events.once(e, cb) }
    off(e, cb) { this.events.off(e, cb) }

    injector(bot) {
        bot.actions = this
    }

    async sendMessage(messageText, autoCommandExecute = true) {
        const bot = this.bot
        if (messageText.startsWith('/') && autoCommandExecute) {
            return await this.sendCommand(messageText)
        }
        bot.packets.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: bot.options.client.username,
            message: messageText,
            xuid: bot.session.xuid || '',
            platform_chat_id: bot.player.metadata.id.platform_chat || '',
            filtered_message: '',
        })
        //Await for to be sure of packet sended on server
        await sleep(200)
        bot.log('actions', `Message send with data "${messageText}"`, 0)
    }

    async sendCommand(commandText, returnOutput = true) {
        const packets = this.bot.packets
        let output
        const commandOutput = (p) => {
            output = p
        }

        if (returnOutput) packets.once('command_output', commandOutput)
        packets.queue('command_request', {
            command: commandText,
            origin: {
                type: this.bot.options.client.username,
                uuid: this.bot.session.uuid,
                request_id: ""
            },
            internal: false,
            version: 84
        })

        await sleep(200)
        this.bot.log('actions', `Command send with data "${commandText}"`, 0)
        if (returnOutput) {
            packets.off('command_output', commandOutput)
            return output ? output.output : undefined
        }
    }

    respawn() {
        const packets = this.bot.packets
        const player = this.bot.player
        const position = V3(0,0,0)

        const respawn = {
            position,
            state: 2,
            runtime_entity_id: player.metadata.id.runtime
        }
        const action = {
            runtime_entity_id: player.metadata.id.runtime,
            action: "respawn",
            position,
            result_position: position,
            face: -1
        }

        packets.once('respawn', () => {
            packets.queue('player_action', action)
        })
        packets.queue('respawn', respawn)

        this.bot.log('actions', `Bot respawned`, 0)
    }
}