import { BotOptions, Bot } from "minetoring";

const options = new BotOptions()
const bot = new Bot()

await bot.init(options)
await bot.connect()

bot.player.events.on('death', () => {
    bot.actions.respawn()
})