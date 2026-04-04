import { BaseModule } from "#Base/BedrockStorage/moduleBase"

import BlobsSystem from "./systems/blobsSystem.js"
import SubChunkSystem from "./systems/subchunkSystem.js"

export class PacketRequester extends BaseModule {
    #signal
    constructor (bot, signal) {
        super(bot)
        this.#signal = signal
    }

    setupPacketRequester() {
        if (this.bot.options.client.settings.cache) {
            this.bot.log('world', `Starting blobsSystem`)
            this.blobsLoop()
        }
        this.subchunksLoop()
    }
    
    blobsLoop() {
        this.blobsSystem = new BlobsSystem(this.bot, this.#signal)
        this.blobsSystem.blobsRequesterLoop()
    }
    
    subchunksLoop() {
        this.subchunkSystem = new SubChunkSystem(this.bot, this.#signal)
        this.subchunkSystem.subChunksRequesterLoop()
    }
    
}