import { sleep } from '#extra/extraFunctions'
import { V3 } from '#extra/extraWorldFunctions'
import { BaseModule } from '#Storage/moduleBase'
import { EventEmitter } from 'node:events'

export class ActionsModule extends BaseModule {
    static name = 'actions'
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
            xuid: bot.player.xuid ?? '',
            platform_chat_id: bot.player.platformChatId ?? '',
            filtered_message: '',
        })

        await sleep(300)
        bot.log('actions', `Message send with data "${messageText}"`, 0)
    }

    async sendCommand(commandText, returnOutput = true) {
        const packets = this.bot.packets
        let output = null

        if (returnOutput) {
            const promiseOutput = new Promise((resolve, reject) => {
                const handler = (packet) => {
                    clearTimeout(timer)
                    resolve(packet)
                }

                const timer = sleep(2000).then(() => {
                    packets.off('command_output', handler)
                    reject(new Error('Timeout waiting for command output'))
                })

                packets.once('command_output', handler)
            })

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

            try {
                output = await promiseOutput
            } catch (e) {
                this.bot.log('actions', `Command output timeout for "${commandText}"`, 2)
            }
        } else {
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
            await sleep(300)
        }

        this.bot.log('actions', `Command sent with data "${commandText}"`, 0)

        return output ? output.output : undefined
    }

    /**
     * 
     * @param {import("#Base/BedrockClient/Modules/BedrockSkin").BedrockSkin} bedrockSkin 
     */
    async changeSkin(bedrockSkin) {
        if (!bedrockSkin.hasSkinData) {
            this.bot.log('actions', `Couldn't change skin, path doesn't exist.`, 3)
            return
        }

        const skinData = await bedrockSkin.readSkin(this.bot.session.pfid)

        this.bot.client.queue('player_skin', {
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

    async look(yaw, pitch, speed = 1) {
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

    async lookAt(targetV3, speed = 1) {
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

            const switchKeys = () => {
                for (const key of controllerKeys) { this.bot.moveController[key] = !this.bot.moveController[key] }
            }

            const handler = () => {
                if (ticksPass < ticks) return ticksPass++
                else {
                    switchKeys()
                    bot.client.off("physicsTick", handler)
                    res()
                }
            }

            switchKeys()
            bot.client.on("physicsTick", handler)
        })
    }
}