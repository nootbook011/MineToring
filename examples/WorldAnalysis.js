import { Bot, BotOptions } from "minetoring";

const options = new BotOptions()
options.configServer({
    host: '127.0.0.1',
    port: 19132
})

const bot = new Bot()
await bot.init(options)
await bot.connect()
await bot.waitUntilSpawn()

const world = bot.world
world.events.on('time', (newt, oldt) => {
    console.log(`Time changed, ${newt}`)
})