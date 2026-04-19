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
    if (dimension.entities.size === 0 || dimension.entities.size === Object.keys(dimension.entities.players).length) {
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
        if (entity.value instanceof Player) return findNewEntity()
        entityEvents(entity.value)
    }
}

function entityEvents(entity) {
    let basetext = `Entity ${entity.metadata.type}, id: ${entity.metadata.id.runtime}`
    if (entity instanceof Player) basetext = `Player ${entity.metadata.username}, uuid: ${entity.metadata.uuid}`
    console.log(`${basetext}, founded.`)

    const healthTrigger = (newAtr, oldAtr) => {
        if (newAtr.health !== oldAtr.health || !oldAtr) {
            console.log(`${basetext}, health change: ${newAtr.health}`)
        }
    }

    entity.events.on('attributes', healthTrigger)
    entity.events.once('despawn', () => {
        console.log(`${basetext}, despawned.`)
        findNewEntity()
    })
}

findNewEntity()