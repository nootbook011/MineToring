import { BaseModule } from "#Base/BedrockStorage/moduleBase"

import BlobsSystem from "./blobsSystem.js"
import SubChunkSystem from "./subchunkSystem.js"

export class PacketRequester extends BaseModule {
    #signal
    constructor (bot, signal) {
        super(bot)
        this.#signal = signal
    }

    #metadata = {
        chunksLoaded: 0
    }

    get metadata() { return this.#metadata }
    
    setupPacketRequester() {
        if (this.bot.options.client.settings.cache) this.blobsLoop()
        this.subchunksLoop()
    }
    
    blobsLoop() {
        this.blobsSystem = new BlobsSystem(this.bot, this.#signal)
        this.blobsSystem.blobsRequesterLoop()
    }
    
    subchunksLoop() {
        this.subchunkSystem = new SubChunkSystem(this.bot, this.#signal)
        this.subchunkSystem.subchunksRequesterLoop()
    }
    
}