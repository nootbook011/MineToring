import { sleep } from '#extra/extraFunctions'
import { Bot, BotOptions } from 'minetoring'
const options = new BotOptions()
options.configServer({
    version: '1.21.50',
    host: '127.0.0.1',
    port: 19132
})
options.configClient({
    username: 'Steve',
    settings: {
        cache: true
    }
})

options.configBotConfig({
    simulateChunksLoading: true
})

console.log(`Bot starting loading data from target server\n`)

const bot = new Bot()
await bot.init(options)

await bot.connect()
await bot.waitUntilSpawn()

await sleep(1000)

bot.disconnect()

console.log(`\nBot loaded data, starting test`)

const world = bot.world
console.log(`\nServer world data:
name: ${world.metadata.name}
difficulty: ${world.metadata.difficulty}
seed: ${world.metadata.seed.world.toString()}
firstGamerule: ${JSON.stringify(world.metadata.settings.gamerules[0])}`)

const overworld = world.getDimension(0)

console.log(`\nLoaded ${overworld.length} chunks in overworld`)

console.log(`Starting check availability of payload data\n`)
const chunksOver = overworld.chunks

const totalStatics = {
    all: 0,
    issues: 0,
}

for (const chunk of chunksOver) {
    const { x, z } = chunk.metadata.pos;
    totalStatics.all++
    
    const problems = Object.values(chunk.subChunks)
        .filter(sub => !sub.hasPayload);

    const hasCriticalError = (!chunk.hasChunk && !bot.options.client.settings.cache) || !chunk.hasSubChunks || problems.length > 0;

    if (hasCriticalError) {
        totalStatics.issues++
        const subChunksReport = problems.length > 0 
            ? problems.map(sub => `\n  - SubChunk [${sub.metadata.pos.x}, ${sub.metadata.pos.y}, ${sub.metadata.pos.z}], payload: ✕, heightmap_type: ${sub.metadata.heightmap_type}`).join('')
            : ' All SubChunks OK or Empty';

        console.warn(
            `[Data Loss Report] Chunk [${x}, ${z}]\n` +
            `• Chunk Data: ${chunk.hasChunk ? '✓' : '✕'}\n` +
            `• SubChunks: ${chunk.hasSubChunks ? '✓' : '✕'}\n` +
            `• SubChunkInfo: ${JSON.stringify(chunk.metadata.subchunksInfo)}\n` +
            `• Issues Found: ${problems.length}\n` +
            `• Details:${subChunksReport}`
        );
    }
}
await sleep(200)
console.log(`\nTotal test statistics:\nTotal chunks ${totalStatics.all} of these, with issue ${totalStatics.issues}\nThis is ${((totalStatics.issues / totalStatics.all) * 100).toFixed(0)}% of total`)