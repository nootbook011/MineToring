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

function findNewPlayer() {
    if (bot.world.players.length == 1) {
        console.log(`No players in render distance, searching..`)
        bot.world.events.once('newPlayer', (player) => {
            playerTrack(player)
        })
        return
    }
    playerTrack(bot.world.players[1])
}

function playerTrack(target) {
    tracking(target)
    bot.moveController.on('forward')
    bot.moveController.on('sprint')

    target.events.on('despawn', () => {
        bot.moveController.off('forward')
        bot.moveController.off('sprint')
        findNewPlayer()
    })
}

async function tracking(target) {
    while (target.isLoaded) { await bot.actions.lookAt(target.position, 20) }
}

//
// Real Client:
// 0.28061676025390625 diff
// { x: 0, y: -0.07840000092983246, z: 0.15321676433086395 }
// Physics Engine:
// 0.2806167814639515 diff
// { x: 0, y: -0.0784, z: 0.15321676267931766 }
// 