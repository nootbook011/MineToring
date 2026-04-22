import { Bot, BotOptions, Entity, Player } from 'minetoring'

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
const dimension = bot.world.getDimension(0)
let entities = dimension.entities.values

function findNewEntity() {
    if (dimension.entities.size === 0) {
        console.log(`No entities in render distance, searching..`)
        dimension.events.once('newEntity', (newEntity) => {
            entityEvents(newEntity)
        })
        return
    }
    const entity = entities.next()

    if (entity.done) {
        entities = dimension.entities.values
        findNewEntity()
    } else {
        if (entity.value instanceof Player && entity.value.metadata.username === bot.username) return findNewEntity()
        entityEvents(entity.value)
    }
}

function entityEvents(entity) {
    let basetext = `Entity ${entity?.metadata?.type}, id: ${entity?.metadata?.id?.runtime}`
    if (entity instanceof Player) basetext = `Player ${entity.metadata.username}`
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