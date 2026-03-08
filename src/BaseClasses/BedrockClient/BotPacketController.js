export class BotPacketController {
    #getClient
    constructor (clientAccessor) {
        this.#getClient = clientAccessor
    }

    // base
    queue(name, data) { this.#getClient().queue(name, data) }
    write(name, data) { this.#getClient().write(name, data) }
    on(name, callback) { this.#getClient().on(name, callback) }
    once(name, callback) { this.#getClient().once(name, callback) }
    off(name, callback) { this.#getClient().off(name, callback) }
    listeners() { return this.#getClient().listeners() }

    // aliases
    qSend(name, data) { this.write(name, data) }
    listen(name, callback) { this.on(name, callback) }
    onceListen(name, callback) { this.once(name, callback) }
    delListener(name, callback) { this.off(name, callback) }
    send(name, data) { this.queue(name, data) }
}