import { BaseBot, BotOptions } from "minetoring"

const opt = new BotOptions()
opt.configServer({
    version: '1.21.50',
    host: '127.0.0.1',
    port: 19132
})
opt.configClient({
    username: 'test'
})

const bot = new BaseBot()
await bot.init(opt)

await bot.connect()