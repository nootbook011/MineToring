import { Bot, BotOptions } from 'minetoring'

// For help and easy setup in IDE
const opt = new BotOptions()
opt.configServer({
    version: '1.21.50',
    host: '127.0.0.1',
    port: 19132
})
opt.configBotConfig({
    simulateChunksLoading: true
})
opt.configClient({
    username: 'Steve',
    settings: {
        cache: true
    }
})

const bot = new Bot()
// Asynchronous initialization for dynamic imports modules in protocol
await bot.init(opt)
await bot.connect()

// Necessary to ensure that client is loaded at the time of sending packets.
await bot.waitUntilSpawn()

// await is optional for actions if you do not need to wait when packet
await bot.actions.sendMessage('Hello World!')
bot.disconnect()