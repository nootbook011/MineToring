import { Bot, BotOptions } from "minetoring"

const options = new BotOptions()
options.configClient({
    username: 'Player123'
})
options.configServer({
    host: '127.0.0.1',
    port: 19132,
    offline: true,
    version: '1.21.50'
})

const bot = new Bot()
await bot.init(options)

function onEvents () {
    bot.actions.on('chat', async (packet) => {
        if (packet.from.name === bot.username || !packet.from.name) return
        const message = `${packet.from.name} said: ${packet.text} on ${new Date().toLocaleString()}`
        await bot.actions.sendMessage(message)
        bot.log('chat', message)
    
        if (packet.text === 'reconnect') {
            await reconnect()
        }
    })
}

async function reconnect() {
    if (bot.status !== Bot.statusList.Disconnected) bot.disconnect()
    await bot.connect()
    await bot.waitUntilSpawn()
    onEvents()
}

reconnect()