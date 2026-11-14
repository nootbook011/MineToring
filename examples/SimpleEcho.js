import { Bot, BotOptions, sleep } from "minetoring"

const options = new BotOptions()
options.configClient({
    username: 'Player'
})
options.configServer({
    host: '127.0.0.1',
    port: 19132,
})
options.configBotConfig({
    logging: { level: 1 }
})

const bot = new Bot()
await bot.init(options)

bot.events.on('chat', async (packet) => {
    if (packet.from.name === bot.username || !packet.from.name) return
    const message = `${packet.from.name} said: ${packet.text} on ${new Date().toLocaleString()}`
    bot.actions.sendMessage(message)
    await sleep(500)
    bot.log('chat', message, 1)

    if (packet.text === 'reconnect') {
        await reconnect()
    }
})

async function reconnect() {
    if (bot.status !== Bot.statusList.Disconnected) bot.disconnect()
    await bot.connect()
    await bot.waitUntilSpawn()
}

reconnect()