import { Bot, BotOptions } from "minetoring"

const opt = new BotOptions()
opt.configServer({
    host: '127.0.0.1',
    port: 19132,
})
opt.configClient({
    username: 'Steve',
})
opt.configNetwork({
    pingBeforeConnect: false
})

const bot = new Bot()
await bot.init(opt)
await bot.connect()

await bot.waitUntilSpawn()

bot.moveController.forward = true