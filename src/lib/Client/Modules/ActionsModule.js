import { sleep } from '#extra/extraFunctions'
import { V3 } from '#extra/extraWorldFunctions'
import { BaseModule } from '#Storage/moduleBase'
import { statusList } from '../BaseBedrockBot.js'

export class ActionsModule extends BaseModule {
    static name = 'actions'

    injector(bot) {
        bot.actions = this
        bot.events.on('status', async (status) => {
            if (status !== statusList.Connect) return
            this.actionsEmitter()
        })
    }

    actionsEmitter() {
        const packets = this.bot.packets
        const emitAction = (name, data) => this.bot.events.emit(name, data)
        const actions = {
            'text': (p) => emitAction('chat', {
                type: p.type,
                from: {
                    name: p?.source_name,
                    xuid: p?.xuid,
                },
                text: p.message,
            }),
            'command_output': (p) => emitAction('command_result', {
                command: p.origin,
                output: p.output
            })
        }

        for (const action in actions) {
            packets.on(action, actions[action])
        }
    }

    sendMessage(messageText, autoCommandExecute = true) {
        const bot = this.bot
        if (messageText.startsWith('/') && autoCommandExecute) return this.sendCommand(messageText)
        
        bot.packets.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: bot.username,
            message: messageText,
            xuid: bot.player.xuid ?? '',
            platform_chat_id: bot.player.platformChatId ?? '',
            filtered_message: '',
        })

        bot.log('actions', `Message send with data "${messageText}"`, 0)
    }
    sendCommand(commandText) {
        const packets = this.bot.packets

        packets.queue('command_request', {
            command: commandText,
            origin: {
                type: 'player',
                uuid: this.bot.player.uuid,
                request_id: ""
            },
            internal: false,
            version: 84
        })

        this.bot.log('actions', `Command sent with data "${commandText}"`, 0)
    }

    /**
     * @param {import("#Core/Storage/BedrockSkin").BedrockSkin} bedrockSkin 
     */
    async changeSkin(bedrockSkin) {
        const packets = this.bot.packets
        if (!bedrockSkin.hasSkinData) {
            this.bot.log('actions', `Couldn't change skin, path doesn't exist.`, 3)
            return
        }

        const skinData = bedrockSkin.readSkin(this.bot.session.pfid)
        packets.queue('player_skin', {
            uuid: this.bot.player.uuid,
            skin: skinData,
            skin_name: '',
            old_skin_name: '',
            is_verified: true
        })

        this.bot.log('actions', `Bot changed skin`, 0)
    }

    async animate(id) {
        const packets = this.bot.packets

        packets.queue('animate', {
            action_id: id,
            runtime_entity_id: this.bot.player.runtimeId
        })

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

    async look(yaw, pitch, speed = 10) {
        return new Promise((res) => {
            const bot = this.bot
            const step = Math.abs(speed) || 1

            const angleDelta = (from, to) => {
                let d = (to - from) % 360
                if (d > 180) d -= 360
                if (d < -180) d += 360
                return d
            }

            const move = (current, target, isAngle) => {
                const delta = isAngle ? angleDelta(current, target) : target - current
                if (Math.abs(delta) <= step) return target
                return current + Math.sign(delta) * step
            }

            const handler = () => {
                bot.player.yaw = move(bot.player.yaw, yaw, true)
                bot.player.pitch = move(bot.player.pitch, pitch, false)

                if (bot.player.yaw === yaw && bot.player.pitch === pitch) {
                    bot.client.off("physicsTick", handler)
                    res()
                }
            }

            bot.client.on("physicsTick", handler)
        })
    }

    async lookAt(targetV3, speed = 10) {
        const { x, y, z } = targetV3
        const pos = this.bot.player.position
        const dx = x - pos.x
        const dy = y - pos.y
        const dz = z - pos.z
        const flat = Math.hypot(dx, dz)

        const yaw = Math.atan2(-dx, dz) * 180 / Math.PI
        const pitch = Math.atan2(-dy, flat) * 180 / Math.PI

        await this.look(yaw, pitch, speed)
    }

    /**
     * 
     * @param {number} ticks 
     * @param {array} controllerKeys 
     * @returns 
     */
    async move(ticks, controllerKeys) {
        return new Promise((res) => {
            const bot = this.bot
            let ticksPass = 0

            const switchKeys = (value) => {
                for (const key of controllerKeys) { this.bot.moveController[key] = value }
            }

            const handler = () => {
                if (ticksPass <= ticks) {
                    switchKeys(true)
                    ticksPass++
                }
                else {
                    switchKeys(false)
                    bot.client.off("physicsTick", handler)
                    res()
                }
            }

            bot.client.on("physicsTick", handler)
        })
    }
}