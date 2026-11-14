import { BedrockItemEntity } from 'minetoring/core/World/BedrockItemEntity'
import { BedrockPlayer } from 'minetoring/core/World/BedrockPlayer'
import { Bot, BotOptions } from 'minetoring'

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

function findNewEntity() {
    if (bot.world.entities.size === 1) {
        console.log(`No entities in render distance, searching..`)
        bot.world.events.once('newEntity', (entity) => entityEvents(entity))
        return
    }

    for (const entity of bot.world.entities.values()) {
        if (entity?.username && entity.username == bot.player.username) continue
        return entityEvents(entity)
    }

    findNewEntity()
}

function entityEvents(entity) {
    let basetext = `Entity ${entity?.type}, id: ${entity?.runtimeId}`
    if (entity instanceof BedrockPlayer) basetext = `Player ${entity.username}`
    if (entity instanceof BedrockItemEntity) basetext = `Item Dropped: ${entity.itemStack.metadata?.name}, count: ${entity.itemStack.count}`
    console.log(`${basetext}, founded.`)

    const healthHandler = (newValue, oldValue) => { if (newValue !== oldValue) console.log(`${basetext} health: ${newValue}`) }
    const moveHandler = () => console.log(`Entity Move: ${entity.position.x}, ${entity.position.y}, ${entity.position.z}`)

    entity.events.on('healthChange', healthHandler)
    entity.events.on('move', moveHandler)

    entity.events.once('death', () => console.log(`${basetext} died.`))
    entity.events.once('despawn', () => {
        console.log(`${basetext} gone.`)
        entity.events.off('healthChange', healthHandler)
        entity.events.off('move', moveHandler)
        return findNewEntity()
    })
}

findNewEntity()