import { sleep } from "#extra/extraFunctions";
import { Bot, BotOptions } from "minetoring";

const options = new BotOptions()
const bot = new Bot()
options.configClient({
    username: 'Chaticks'
})

await bot.init(options)
await bot.connect()
await bot.waitUntilSpawn()
const { world, actions, player } = bot

class Commands {
    list = {
        'time': [this.clock.bind(this), 'Tell you what time it is in game now'],
        'locate': [this.locator.bind(this), 'Where im and where world spawnpoint'],
        'leave': [this.leave.bind(this), 'Leave the game, work only if you admin']
    }

    clock() {
        actions.sendMessage(`Now ${formatTo12H(world.time)}, have a good ${getDayPhase(world.time)}!`)
    }
    locator() {
        const spawnPos = world.metadata.players.spawnpoint
        const pos = player.position
        actions.sendMessage(`Im on ${Math.max(pos.x).toFixed(0)}, ${Math.max(pos.y).toFixed(0)}, ${Math.max(pos.z).toFixed(0)}. Spawn in ${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z}.`)
    }
    async leave(data) {
        const player = world.players[data.from.name]
        if (player.metadata.permission.level !== 'operator') {
            actions.sendMessage('I dont trust you')
        } else {
            await actions.sendMessage(`Okay, goodbye`)
            bot.disconnect()
        }
    }
}
const commands = new Commands()

await actions.sendMessage(`Hello everybody! I - ${options.client.username}, a chatbot built on MineToring framework!`)
await sleep(500)
await actions.sendMessage(`Here's what I can do:`)
for (const cmd in commands.list) {
    await sleep(500)
    await actions.sendMessage(`${cmd}: ${commands.list[cmd][1]}`)
}

bot.actions.on('chat', async (data) => {
    const { text, from, type } = data
    if (type !== 'chat' || !text) return
    const cmd = commands.list[text.toLowerCase()]
    if (!cmd) return

    await cmd[0](data)
})

const dayCycle = {
    0: 'morning',
    2000: 'day',
    6000: 'afternoon',
    12000: 'evening',
    13000: 'night',
    23000: 'sunrise',
}
function getDayPhase(ticks) {
    const timeOfDay = ticks % 24000
    const phases = Object.keys(dayCycle)
        .map(Number)
        .sort((a, b) => a - b)

    let currentPhase = dayCycle[phases[0]]
    for (const phase of phases) {
        if (timeOfDay >= phase) {
            currentPhase = dayCycle[phase]
        } else {
            break
        }
    }

    return currentPhase
}
function formatTo12H(ticks) {
    const timeOfDay = ticks % 24000

    let totalHours = (timeOfDay / 1000) + 6
    if (totalHours >= 24) totalHours -= 24

    const hours24 = Math.floor(totalHours)
    const minutes = Math.floor((totalHours % 1) * 60)

    const period = hours24 >= 12 ? 'PM' : 'AM'
    let hours12 = hours24 % 12
    if (hours12 === 0) hours12 = 12

    const formattedMinutes = minutes.toString().padStart(2, '0')

    return `${hours12}:${formattedMinutes} ${period}`
}