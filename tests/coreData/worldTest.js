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
        cache: true
    }
})

const bot = new Bot()

await bot.init(opt)
await bot.connect()
await bot.waitUntilSpawn()
await sleep(1500)
bot.disconnect()

const world = bot.world
const dim = world.getDimension(0)

console.log(`Map size: ${dim.length}`)

const chunks = dim.chunks
for (let i = 0; i < 5; i++) {
    const chunk = chunks.next().value
    console.log(`Chunk ${i}: ${JSON.stringify(chunk.metadata, null, 2)}\nsubchunks: ${Object.keys(chunk.subChunks).length}\nsub-4: ${JSON.stringify(chunk.subChunks[-4].metadata, null, 2)}`)
    console.log(chunk.data)
    console.log(chunk.subChunks[-4].data)
}

const validChunkZero = await dim.validateChunk(0, 0)
const BlockAtZero = validChunkZero.DChunk.getBlock(V3(0, 0, 0))

console.log(BlockAtZero)