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

const client = bot.options.client

function onEvents () {
    bot.packets.on('text', async (packet) => {
        if (packet.source_name === client.username || !packet.source_name) return
        const message = `${packet.source_name} said: ${packet.message} on ${new Date().toLocaleString()}`
        await bot.actions.sendMessage(message)
        bot.log('chat', message)
    
        if (packet.message === 'reconnect') {
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