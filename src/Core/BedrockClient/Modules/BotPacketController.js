import { BasePlugin } from "#Storage/moduleBase"

export class BotPacketController extends BasePlugin {
    injector(bot) {
        bot.packets = this
    }

    // base
    queue(name, data) { this.bot.client.queue(name, data) }
    write(name, data) { this.bot.client.write(name, data) }
    on(name, callback) { this.bot.client.on(name, callback) }
    once(name, callback) { this.bot.client.once(name, callback) }
    off(name, callback) { this.bot.client.off(name, callback) }
    listeners() { return this.bot.client.listeners() }

    // aliases
    qSend(name, data) { this.write(name, data) }
    listen(name, callback) { this.on(name, callback) }
    onceListen(name, callback) { this.once(name, callback) }
    delListener(name, callback) { this.off(name, callback) }
    send(name, data) { this.queue(name, data) }
}