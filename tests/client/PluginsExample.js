import { sleep } from "#extra/extraFunctions";
import { BotOptions, Bot } from "minetoring";
import { BasePlugin } from "minetoring/BasePlugin";

class MyPlugin extends BasePlugin {
    name() {
        const name = this.bot.options.client.username
        return name
    }
}

const options = new BotOptions()
options.configClient({
    username: 'Alex'
})
options.configServer({
    host: '127.0.0.1',
    version: '1.21.50'
})

const bot = new Bot()
await bot.init(options, { plugins: MyPlugin })

await bot.connect()
await bot.waitUntilSpawn()

await bot.actions.sendMessage(`My name is ${bot.MyPlugin.name()}`)

bot.disconnect()