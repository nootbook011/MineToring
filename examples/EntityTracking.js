import { Bot, BotOptions, Entity, Player } from 'minetoring'

const options = new BotOptions()
options.configServer({
    host: '127.0.0.1',
    port: 19132
})
options.configClient({
    username: 'entityTracker',
    settings: {
        viewDistance: 15,
        cache: true
    }
})

const bot = new Bot()
await bot.init(options)
await bot.connect()
await bot.waitUntilSpawn()
console.log('Spawned')
let entities = bot.world.entities.values

function findNewEntity() {
    if (bot.world.entities.size === 0 || Object.keys(bot.world.players).length === bot.world.entities.size) {
        console.log(`No entities in render distance, searching..`)
        bot.world.events.once('newEntity', (newEntity) => {
            entityEvents(newEntity)
        })
        return
    }
    const entity = entities.next()

    if (entity.done) {
        entities = bot.world.entities.values
        findNewEntity()
    } else {
        if (entity.value instanceof Player) return findNewEntity()
        entityEvents(entity.value)
    }
}

function entityEvents(entity) {
    let basetext = `Entity ${entity?.type}, id: ${entity?.runtimeId}`
    if (entity instanceof Player) basetext = `Player ${entity.username}`
    console.log(`${basetext}, founded.`)

    entity.events.on('attributes', (newAtr, oldAttr) => {
        if (newAtr.health !== oldAttr.health) console.log(`${basetext} health: ${newAtr.health}, pos: ${entity.position.x}, ${entity.position.y}, ${entity.position.z}`)
    })

    entity.events.once('despawn', () => {
        console.log(`${basetext} gone.`)
        findNewEntity()
    })
}

findNewEntity()