import { BaseModule } from '#Storage/moduleBase'

export default class PacketsAuto extends BaseModule {
    constructor(BedrockBot) {
        super(BedrockBot)
    }
    
    setupAutoPacketControll() {
        const bot = this._getClient
        const recursiveLoop = () => {
            bot.waitUntilConnect().then(() => {
                this.#autoStartGameHandler() 
                this.#autoChunksWriter()
                this.#autoSubchunksWriter()

                bot.waitUntilDisconnect().then(recursiveLoop)
            })
        }
        recursiveLoop()
    }
    
    #autoStartGameHandler() {
        const bot = this._getClient
        bot.packets.once('start_game', (startgame) => {
            bot.world.init(startgame)
            bot.log('autoph', `World startgame initialized`)
        })
    }
    
    #autoChunksWriter() {
        const bot = this._getClient
        bot.packets.on('level_chunk', (chunk) => {
            const dimension = bot.world.getDimension(chunk.dimension)
            
            dimension.addChunk({chunk}, chunk.x, chunk.z)
        })
    }
    
    #autoSubchunksWriter() {
        const bot = this._getClient
        bot.packets.on('subchunk', (subchunks) => {
            const dimension = bot.world.getDimension(subchunks.dimension)
            
            dimension.addChunk({subchunks}, subchunks.origin.x, subchunks.origin.z)
        })
    }
}