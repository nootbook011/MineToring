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
bot.moveController.sprint = true
//bot.moveController.jump = true

// { x: 0, y: -0.07840000092983246, z: 0.15321676433086395 }
// { x: 0, y: -0.0784, z: 0.15321676267931766 }
// 