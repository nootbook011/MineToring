import { Bot, BotOptions, sleep } from "minetoring"

// For help and easy setup in IDE
const opt = new BotOptions()
opt.configServer({
    host: '127.0.0.1',
    port: 19132
})
opt.configClient({
    username: 'Steve',
})

const bot = new Bot()
await bot.init(opt)
await bot.connect()

// Necessary to ensure that client is loaded at the time of sending packets
await bot.waitUntilSpawn()

bot.actions.sendMessage('Hello World!')
await sleep(500)

bot.disconnect()