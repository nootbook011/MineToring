import { BaseModule } from "#Base/BedrockStorage/moduleBase"

import { BlobsSystem } from "./systems/blobsSystem.js"
import { SubChunkSystem } from "./systems/subchunkSystem.js"

export class PacketRequester extends BaseModule {
    #signal
    constructor (bot, signal) {
        super(bot)
        this.#signal = signal
    }

    startCollectData() {
        if (this.bot.options.client.settings.cache) {
            this.bot.log('world', `Starting blobsSystem`)
            this.createBlobs()
            this.blobsSystem.blobsDataWriter()
        }
        this.bot.log('world', `Starting SubChunksSystem`)
        this.createSubChunks()
        this.subchunkSystem.subChunksDataWriter()
    }

    startRequestData() {
        this.bot.log('world', `Starting data query systems`)
        if (this.bot.options.client.settings.cache) this.blobsSystem.blobsRequesterLoop()
        this.subchunkSystem.subChunksRequesterLoop()
    }
    
    createBlobs() {
        this.blobsSystem = new BlobsSystem(this.bot, this.#signal)
    }
    
    createSubChunks() {
        this.subchunkSystem = new SubChunkSystem(this.bot, this.#signal)
    }
    
}