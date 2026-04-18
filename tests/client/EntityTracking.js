import { sleep } from '#extra/extraFunctions'
import { Bot, BotOptions } from 'minetoring'

const options = new BotOptions()
options.configServer({
    //version: '1.21.50',
    host: '127.0.0.1',
    port: 19132
})
options.configClient({
    username: 'JustSimple',
    settings: {
        viewDistance: 5,
        cache: true
    }
})
options.configNetwork({
    pingBeforeConnect: true
})

const bot = new Bot()
await bot.init(options)
await bot.connect()
await bot.waitUntilSpawn()
console.log('Spawned')

function findNewEntity() {
    const dimension = bot.world.getDimension(0)
    const entities = dimension.entities.values
    const entity = entities.next()

    if (entity.done) {
        console.log(`No entities in render distance, searching..`)
        dimension.events.once('newEntity', (newEntity) => {
            entityEvents(newEntity)
        })
    } else {
        entityEvents(entity.value)
    }
}

function entityEvents(entity) {
    console.log(`Entity ${entity.metadata.type}, id: ${entity.metadata.id.runtime}, founded.`)
    const healthTrigger = (newAtr, oldAtr) => {
        if (newAtr.health !== oldAtr.health) {
            console.log(`Entity ${entity.metadata.type}, id: ${entity.metadata.id.runtime}, health change: ${newAtr.health}`)
        }
    }

    entity.events.on('attributes', healthTrigger)
    entity.events.once('despawn', () => {
        console.log(`Entity ${entity.metadata.type}, id: ${entity.metadata.id.runtime}, despawned.`)
        findNewEntity()
    })
}

const dimension = bot.world.getDimension(0)

dimension.events.on('newPlayer', (player) => {
    player.events.on('attributes', (attr) => {
        console.log(JSON.stringify(attr))
    })
})