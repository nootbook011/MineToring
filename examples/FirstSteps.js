import { Bot, BotOptions } from "minetoring"

// For help and easy setup in IDE
const opt = new BotOptions()
opt.configServer({
    host: '127.0.0.1',
    port: 19132
})
opt.configClient({
    username: 'Steve'
})

const bot = new Bot()
// Asynchronous initialization for dynamic imports modules in protocol
await bot.init(opt)
await bot.connect()

// Necessary to ensure that client is loaded at the time of sending packets
await bot.waitUntilSpawn()

// await is optional for actions when you don't have to wait for packet to be processed by server
await bot.actions.sendMessage('Hello World!')
bot.disconnect()