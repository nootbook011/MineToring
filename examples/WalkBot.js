import { Bot, BotOptions } from "minetoring"

const opt = new BotOptions()
opt.configServer({
    host: '127.0.0.1',
    port: 19132,
})
opt.configClient({
    username: 'WalkingBot',
})

const bot = new Bot()
await bot.init(opt)
await bot.connect()
await bot.waitUntilSpawn()

bot.player.events.on('death', () => {
    bot.actions.respawn()
})

findNewPlayer()

function findNewPlayer() {
    if (bot.world.players.size == 1) {
        console.log(`No players in render distance, searching..`)
        bot.world.events.once('newPlayer', (player) => {
            playerTrack(player)
        })
        return
    }

    for (const player of bot.world.players.values()) {
        if (player.username == bot.player.username) continue
        playerTrack(player)
    }
}

async function playerTrack(target) {
    console.log(`Tracking ${target?.username}`)
    tracking(target)
    bot.moveController.forward = true
    bot.moveController.sprint = true

    target.events.once('despawn', () => {
        bot.moveController.forward = false
        bot.moveController.sprint = false
        findNewPlayer()
    })
}

async function tracking(target) {
    while (target.isLoaded) { await bot.actions.lookAt(target.position, 20) }
}