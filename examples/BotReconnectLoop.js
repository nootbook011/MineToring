import { sleep } from "minetoring/extra/extraFunctions"
import { Bot, BotOptions } from "minetoring"

const options = new BotOptions()
options.configServer({
    version: '1.21.50',
    host: '127.0.0.1',
    port: 19132
})

const bot = new Bot()
await bot.init(options)

async function reconnect() {
    if (bot.status !== Bot.statusList.Disconnected) bot.disconnect()
    await bot.connect()
    await bot.waitUntilSpawn()
}

await reconnect()

for (let i = 0; i < 3; i++) {
    await sleep(5000)
    
    console.log('Reconnecting..')
    await reconnect()
}

bot.disconnect()