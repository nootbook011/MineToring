import { getPercent, sleep } from '#extra/extraFunctions'
import { Bot, BotOptions } from 'minetoring'
import v8 from 'v8';

const options = new BotOptions()
options.configServer({
    host: '127.0.0.1',
    port: 19132
})
options.configClient({
    username: 'Steve',
    settings: {
        cache: true,
        viewDistance: 25,
    }
})

options.configBotConfig({
    simulateChunksLoading: true
})

const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

const getResourceSnapshot = () => {
    const mem = process.memoryUsage();
    const heap = v8.getHeapStatistics();
    return {
        rss: toMB(mem.rss),
        heapUsed: toMB(mem.heapUsed),
        heapTotal: toMB(mem.heapTotal),
        external: toMB(mem.external),
        heapLimit: toMB(heap.heap_size_limit)
    };
};

let bot;
const metrics = {
    start: performance.now(),
    connectionTime: 0,
    spawnTime: 0,
    processingTime: 0,
    memSnapshots: []
};

console.log(`• Bot starting loading data from target server\n`);

let antiTimeout = setTimeout(() => {
    console.warn('Timeout after 5 minutes, bot is too slow.');
    bot?.disconnect();
    process.exit(1);
}, 300000);

try {
    bot = new Bot();
    await bot.init(options);
    bot.packets.on('error', (e) => { bot.log(`protocol`, `Protocol error: ${e}`) })
    
    const connStart = performance.now();
    await bot.connect()
    metrics.connectionTime = performance.now() - connStart;

    const spawnStart = performance.now();
    await bot.waitUntilSpawn()
    metrics.spawnTime = performance.now() - spawnStart;

    metrics.memSnapshots.push(getResourceSnapshot())
    
    bot.disconnect();
} catch (err) {
    console.error(`\nError occurred while bot loading data, test is stopped`);
    throw err;
} finally {
    clearTimeout(antiTimeout);
}

const totalTime = performance.now() - metrics.start;
const finalMem = getResourceSnapshot();

console.log(`--- PERFORMANCE REPORT ---`);
console.log(`• Total Execution: ${totalTime.toFixed(0)} ms`);
console.log(`• Connection Handshake: ${metrics.connectionTime.toFixed(0)} ms`);
console.log(`• World Spawn Latency: ${metrics.spawnTime.toFixed(0)} ms`);
console.log(`• Efficiency: ~${(401 / (totalTime / 1000)).toFixed(1)} chunks/sec`);

console.log(`\n--- MEMORY ANALYSIS ---`);
console.log(`• Heap Used: ${finalMem.heapUsed} MB / ${finalMem.heapTotal} MB`);
console.log(`• External (Buffers): ${finalMem.external} MB`);
console.log(`• System Limit: ${finalMem.heapLimit} MB`);
console.log(`• Memory Growth: ${(finalMem.heapUsed - (metrics.memSnapshots[0]?.heapUsed || 0)).toFixed(2)} MB since spawn`);

const world = bot.world;
const overworld = world.getDimension(0);
const chunksOver = overworld.chunks;

const totalStatics = { all: 0, issues: 0 };

console.log(`\n--- DATA INTEGRITY TEST ---`);
const procStart = performance.now();

for (const chunk of chunksOver.values) {
    totalStatics.all++;
    const { x, z } = chunk.metadata.pos;
    
    const problems = Object.values(chunk.subChunks).filter(sub => !sub.hasPayload);
    const hasCriticalError = !chunk.hasChunk || !chunk.hasSubChunks || problems.length > 0;
    
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

metrics.processingTime = performance.now() - procStart;

console.log(`• Data Validation Speed: ${metrics.processingTime.toFixed(2)} ms for ${totalStatics.all} chunks`);
console.log(`• Settings used: ${JSON.stringify(bot.options.options, undefined, 2)}`)
console.log(`\nTotal test statistics:
Total chunks ${totalStatics.all} of these, with issue ${totalStatics.issues}
Success rate: ${(100 - getPercent(totalStatics.all, totalStatics.issues)).toFixed(2)}%`);