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
//bot.moveController.sneak = true
bot.moveController.sprint = true
bot.moveController.jump = true

//
// Real Client:
// 0.28061676025390625 diff
// { x: 0, y: -0.07840000092983246, z: 0.15321676433086395 }
// Physics Engine:
// 0.2806167814639515 diff
// { x: 0, y: -0.0784, z: 0.15321676267931766 }
// 