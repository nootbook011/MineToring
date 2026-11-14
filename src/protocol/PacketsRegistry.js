export class PacketsRegistry {
    #packetsHandlers = new Map()
    #packetsBuilders = new Map()

    hadnlers() { return this.#packetsHandlers.entries() }
    builders() { return this.#packetsBuilders.entries() }

    loadHandler(packet, handler) {
        this.#packetsHandlers.set(packet, handler)
        return handler
    }
    loadBuilder(packet, builder) {
        this.#packetsBuilders.set(packet, builder)
        return builder
    }

    getHandler(packet) {
        return this.#packetsHandlers.get(packet)
    }
    getBuilder(packet) {
        return this.#packetsBuilders.get(packet)
    }
}