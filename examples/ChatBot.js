import { sleep } from "minetoring/extra/extraFunctions";
import { Bot, BotOptions } from "minetoring";
import { GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants";

const options = new BotOptions()
options.configClient({
    settings: {
        viewDistance: 15
    }
})
options.configBotConfig({
    logging: { level: 1 }
})
const bot = new Bot()
options.configClient({
    username: 'Chaticks'
})

await bot.init(options)
await bot.connect()
await bot.waitUntilSpawn()
const { world, server, actions, player } = bot

class Commands {
    list = {
        'time': [this.clock.bind(this), 'Tell you what time it is in game now'],
        'locate': [this.locator.bind(this), 'Where im and where world spawnpoint'],
        'leave': [this.leave.bind(this), 'Leave the game, work only if you admin'],
        'stats': [this.stats.bind(this), 'My player stats'],
        'myinfo': [this.myinfo.bind(this), 'All the information I have about you'],
    }

    clock() {
        actions.sendMessage(`Now ${formatTo12H(world.time)}, have a good ${getDayPhase(world.time)}!`)
    }
    locator() {
        const spawnPos = world.metadata.players.spawnpoint
        const pos = player.position
        actions.sendMessage(`Im on ${Math.max(pos.x).toFixed(0)}, ${Math.max(pos.y).toFixed(0)}, ${Math.max(pos.z).toFixed(0)}. Spawn in ${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z}.`)
    }
    stats() {
        actions.sendMessage(`Health: ${player.health}, food: ${player.food}, xp: ${player.xp}.`)
    }
    myinfo(data) {
        const target = server.playerList.getPlayer(data.from.name)
        actions.sendMessage(`That's what I know: your device is ${target.metadata.device.os}:${target.metadata.device.id}, you ${PERMISSION_LEVELS.reverse[target.metadata.permission.level]} with ${GAMEMODES.reverse[target.metadata.gamemode]}. your health ${target.health}, food ${target.food}, xp ${target.xp} and your ip is 162.34.8.. just kidding.`)
    }
    async leave(data) {
        const target = server.playerList.getPlayer(data.from.name)
        if (target.metadata.permission.level !== 'operator') {
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

    bot.log('commands', `Bot execute ${text} command`, 1)

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