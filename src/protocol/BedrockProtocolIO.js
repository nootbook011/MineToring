import { loadPacketHandlers } from "./handlers.js";
import { PacketsRegistry } from "./PacketsRegistry.js";

export class BedrockProtocolIo {
    /** @type {import("#lib/Client/BedrockBot").BedrockBot} */
    bot
    packets = new PacketsRegistry()

    constructor(bot) {
        this.bot = bot
    }

    init() {
        loadPacketHandlers(this.packets, this.bot)
    }

    bindAllPacketsToBot() {
        const handlers = this.packets.hadnlers()
        for (const [packet, handler] of handlers) {
            this.bot.client.on(packet, (p) => handler(p))
        }
    }

    readPacket(name, packet) {
        const handler = this.packets.getHandler(name)
        return handler(packet)
    }
    buildPacket(name) {

    }
}