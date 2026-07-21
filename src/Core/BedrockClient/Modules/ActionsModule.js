import { sleep } from '#extra/extraFunctions'
import { V3 } from '#extra/extraWorldFunctions'
import { BaseModule } from '#Storage/moduleBase'
import { EventEmitter } from 'node:events'

export class ActionsModule extends BaseModule {
    #events = new EventEmitter()
    get events() { return this.#events }

    on(e, cb) { this.events.on(e, cb) }
    once(e, cb) { this.events.once(e, cb) }
    off(e, cb) { this.events.off(e, cb) }

    injector(bot) {
        bot.actions = this
    }

    actionsEmitter() {
        const packets = this.bot.packets
        const emitAction = (name, data) => this.events.emit(name, data)
        const actions = {
            'text': (p) => emitAction('chat', {
                type: p.type,
                from: {
                    name: p?.source_name,
                    xuid: p?.xuid,
                },
                text: p.message,
            })
        }

        for (const action in actions) {
            packets.on(action, actions[action])
        }
    }

    async sendMessage(messageText, autoCommandExecute = true) {
        const bot = this.bot
        if (messageText.startsWith('/') && autoCommandExecute) {
            return await this.sendCommand(messageText)
        }
        bot.packets.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: bot.username,
            message: messageText,
            xuid: bot.player.xuid || '',
            platform_chat_id: bot.player.platformChatId || '',
            filtered_message: '',
        })
        //Await for to be sure of packet sended on server
        await sleep(200)
        bot.log('actions', `Message send with data "${messageText}"`, 0)
    }

    async sendCommand(commandText, returnOutput = true) {
        const packets = this.bot.packets
        const promiseOutput = new Promise((res) => {
            packets.once('command_output', (p) => { output = p })
        })
        let output
        
        packets.queue('command_request', {
            command: commandText,
            origin: {
                type: this.bot.username,
                uuid: this.bot.player.uuid,
                request_id: ""
            },
            internal: false,
            version: 84
        })
        if (returnOutput) {
            // TODO: fallback timer if server dont sent output
            await promiseOutput
        }
        else await sleep(200)
        
        this.bot.log('actions', `Command send with data "${commandText}"`, 0)
        if (returnOutput) {
            packets.off('command_output', commandOutput)
            return output ? output.output : undefined
        }
    }

    async animate(id) {
        const packets = this.bot.packets
        packets.send('animate', {
            action_id: id,
            runtime_entity_id: this.bot.player.runtimeId
        })
        await sleep(100)
        this.bot.log('actions', `Bot animate "${id}"`, 0)
    }

    respawn() {
        const packets = this.bot.packets
        const player = this.bot.player
        const position = V3(0, 0, 0)

        const respawn = {
            position,
            state: 2,
            runtime_entity_id: player.runtimeId
        }
        const action = {
            runtime_entity_id: player.runtimeId,
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