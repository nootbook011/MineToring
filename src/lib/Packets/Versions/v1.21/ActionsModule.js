import { sleep } from '#extra/extraFunctions'
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
        await sleep(100)
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

        await sleep(100)
        this.bot.log('actions', `Command send with data "${commandText}"`, 0)
        if (returnOutput) {
            packets.off('command_output', commandOutput)
            return output ? output.output : undefined
        }
    }

    respawn() {
        const packets = this.bot.packets
        const player = this.bot.player

        packets.send('respawn', {
            position: this.bot.world.metadata.players.spawnpoint,
            state: 2,
            runtime_entity_id: player.metadata.id.runtime
        })

        packets.send('player_action', {
            runtime_entity_id: player.metadata.id.runtime,
            action: "respawn",
            position: this.bot.world.metadata.players.spawnpoint,
            result_position: this.bot.world.metadata.players.spawnpoint,
            face: -1
        })

        this.bot.log('actions', `Bot respawned`, 0)
    }
}