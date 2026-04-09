import { sleep } from '#extra/extraFunctions'
import { V3 } from '#extra/extraWorldFunctions'
import { BotOptions, Bot } from 'minetoring'
/*
Before starting this test, place a block at coordinates 0 0 0 on the target server,
make sure that the spawn location is nearby and in bot's view distance area.
*/
const opt = new BotOptions()
opt.configServer({
    version: '1.21.50'
})
opt.configClient({
    settings: {
        cache: true,
        viewDistance: 10,
    }
})
opt.configBotConfig({
    simulateChunksLoading: true
})

const bot = new Bot()
await bot.init(opt)

await bot.connect()
await bot.waitUntilSpawn()
bot.disconnect()

const world = bot.world
const dim = world.getDimension(0)

console.log(`Map size: ${dim.length}, entities: ${dim.entitiesSize}`)

const entities = dim.entities
for (const entity of entities) {
    console.log(`Entity ${entity.metadata.type}, runtimeId ${entity.metadata.id.runtime}, health ${entity.getAttribute('health')}`)
}


/**
    for (let i = 0; i < 5; i++) {
        const chunk = chunks.next().value
        console.log(`Chunk ${i}: ${JSON.stringify(chunk.metadata, null, 2)}\nsubchunks: ${Object.keys(chunk.subChunks).length}\nsub-4: ${JSON.stringify(chunk.subChunks[-4].metadata, null, 2)}`)
        console.log(chunk.data)
        console.log(chunk.subChunks[-4].data)
    }
*/

/**
    const validChunkZero = await dim.validateChunk(0, 0)
    const BlockAtZero = validChunkZero.DChunk.getBlock(V3(0, 0, 0))
*/