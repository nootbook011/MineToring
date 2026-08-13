import { sleep } from "minetoring/extra/extraFunctions";
import { Bot, BotOptions } from "minetoring";
import { GAMEMODES, PERMISSION_LEVELS } from "minetoring/extra/extraConstants";
import { getNearV3Points, isV3, V3 } from "#extra/extraWorldFunctions";
import { simplify } from 'prismarine-nbt'

const options = new BotOptions()
options.configClient({
    username: 'Chaticks',
    customSkin: {
        skinPath: 'notch.png'
    },
    settings: {
        viewDistance: 15
    }
})
const bot = new Bot()
options.configClient({
    username: 'Chaticks'
})

const bot = new Bot()

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
        'find': [this.find.bind(this), `Find block at the area. Type coords like in fill command and block name at the end.`],
        'block': [this.block.bind(this), 'Say what block is.'],
        'radar': [this.radar.bind(this), 'Entities that are nearby.'],
        'copyskin': [this.copySkin.bind(this), 'Copy player skin.'],
    }

    async copySkin(data, cmdParts) {
        const targetName = String(cmdParts[1])
        const target = server.getPlayer(targetName)
        if (!target) {
            actions.sendMessage(`Cannot find player ${targetName}, maybe you spelled it wrong?`)
            return
        }
        else if (!target.skin) {
            actions.sendMessage(`No skin data for player ${target.username}.`)
            return
        }

        await actions.changeSkin(target.skin)
    }

    radar() {
        const entities = world.entities
        const players = world.players

        actions.sendMessage(`There are ${entities.size - Object.keys(players).length} entities and ${Object.keys(players).length - 1} players next to me`)
    }

    block(data, cmdParts) {
        const v3 = V3(Number(cmdParts[1]), Number(cmdParts[2]), Number(cmdParts[3]))
        if (!isV3(v3)) {
            actions.sendMessage(`Wrong coordinates!`)
            return
        }
        let block
        try {
            block = world.getDimension(player.dimension).getBlock(v3.x, v3.y, v3.z)
        } catch(e) { }
        
        if (!block) {
            actions.sendMessage(`Too far from me.`)
            return
        }

        actions.sendMessage(`Block at ${v3.x} ${v3.y} ${v3.z} is ${block.metadata?.name || block.metadata?.displayName}.`)
        //console.log(simplify(block.entityNBT))
    }

    clock() {
        actions.sendMessage(`Now ${formatTo12H(world.time)}, have a good ${getDayPhase(world.time)}!`)
    }
    locator() {
        const spawnPos = world.settings.spawnpoint
        const pos = player.position
        actions.sendMessage(`Im on ${Math.round(pos.x).toFixed(0)}, ${Math.round(pos.y).toFixed(0)}, ${Math.round(pos.z).toFixed(0)}, biome: ${world.getDimension(player.dimension).getBiome(pos.x, pos.y, pos.z)?.displayName}${!!player.structure ? `, structure: ${player.structure}` : ''}. Spawn in ${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z}.`)
    }
    stats() {
        actions.sendMessage(`Health: ${player.health}, food: ${player.food}, xp: ${player.xp}.`)
    }
    myinfo(data) {
        const target = server.playerList.getPlayer(data.from.name)
        if (!target) return
        const statsText = `${target?.health ? `your health ${target.health.toFixed(0)}, ` : ''}${target?.food ? `food ${target.food}, ` : ''}${target?.xp ? `xp ${target.xp}, ` : ''}`
        actions.sendMessage(`That's what I know: your device is ${target.device?.os}, you ${PERMISSION_LEVELS.reverse[target.permission]} with ${GAMEMODES.reverse[target.gamemode]}. ${statsText}your ip is 162.34.8.. just kidding.`)
    }
    async leave(data) {
        const target = server.playerList.getPlayer(data.from.name)
        if (!target) return
        if (target.permission !== PERMISSION_LEVELS.operator) {
            actions.sendMessage('I dont trust you')
        } else {
            await actions.sendMessage(`Okay, goodbye`)
            bot.disconnect()
        }
    }

    async find(data, cmdParts) {
        const blockName = cmdParts[7].toLowerCase()
        const blockInRegistry = world.registry.blocksByName[blockName]
        if (!blockInRegistry) {
            await actions.sendMessage(`I dont know block ${blockName}, maybe you spelled it wrong?`)
            return
        }

        const from = V3(Number(cmdParts[1]), Number(cmdParts[2]), Number(cmdParts[3]))
        const to = V3(Number(cmdParts[4]), Number(cmdParts[5]), Number(cmdParts[6]))
        if (!isV3(from) || !isV3(to)) {
            await actions.sendMessage(`Wrong coordinates.`)
            return
        }

        const blocks = world.getDimension(player.dimension).findBlocks((data) => data.id === blockInRegistry.id, from, to)

        await actions.sendMessage(`Found ${blocks.length} results around.`)
        if (blocks.length === 0) {
            await actions.sendMessage(`There nothing what you search.`)
            return
        }
        await actions.sendMessage(`There first 5 results:`)
        for (let i = 0; i < 5; i++) {
            const block = blocks.next().value
            if (!block) continue
            await actions.sendMessage(`${block.metadata?.displayName || block.metadata?.name}: ${block.position.x}, ${block.position.y}, ${block.position.z}`)
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

bot.player.events.on('death', () => {
    bot.actions.respawn()
})

bot.actions.on('chat', async (data) => {
    const { text, from, type } = data
    if (type !== 'chat' || !text || from.name == bot.username) return
    const cmdParts = text.split(' ')
    const cmd = commands.list[cmdParts[0].toLowerCase()]
    if (!cmd) return

    bot.log('commands', `Bot execute ${cmdParts[0]} command`, 1)

    await cmd[0](data, cmdParts)
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