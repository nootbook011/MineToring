import { getPercent, sleep } from '#extra/extraFunctions'
import { Bot, BotOptions } from 'minetoring'
import v8 from 'v8';
import os from 'os';
import { BedrockEntity } from '#Base/BedrockWorld/bedrockObjects/BaseBedrockEntity';
import { BedrockPlayer } from '#Base/BedrockWorld/bedrockObjects/BaseBedrockPlayer';
import { GAMEMODES, PERMISSION_LEVELS } from '#extra/extraConstants';
import { getCpuUsage, getResourceSnapshot } from './index.js';
import { BedrockSubChunk } from '#Base/BedrockWorld/bedrockObjects/BaseBedrockSubChunk';
import { PalettedStorage } from '#Base/BedrockStorage/Binary/PalettedStorage';

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
    logging: {
        level: 1
    },
    fastLoading: true
})

let bot;
const metrics = {
    start: performance.now(),
    cpuStart: process.cpuUsage(),
    connectionTime: 0,
    spawnTime: 0,
    processingTime: 0,
    cpuDuringLoad: 0,
    cpuDuringValidation: 0,
    memSnapshots: []
};

console.log(`• Bot starting loading data from target server\n`);

let antiTimeout = setTimeout(() => {
    console.warn('Timeout after 5 minutes, bot is too slow.');
    bot?.disconnect();
    process.exit(1);
}, 300000);

try {
    bot = new Bot()
    await bot.init(options)

    const loadStart = performance.now();
    const startHrTime = process.hrtime.bigint();
    const loadCpuStart = process.cpuUsage();
    const spawnStart = performance.now();
    await bot.connect()

    metrics.memSnapshots.push(getResourceSnapshot())
    await bot.waitUntilSpawn()
    metrics.spawnTime = performance.now() - spawnStart;
    metrics.cpuDuringLoad = getCpuUsage(startHrTime, loadCpuStart);
    

    bot.log(`info`, `Waiting 10 seconds.`)
    await sleep(10000)

    bot.disconnect()
} catch (err) {
    console.error(`\nError occurred while bot loading data, test is stopped`);
    throw err;
} finally {
    clearTimeout(antiTimeout);
}

const procStart = performance.now();
const startHrTime = process.hrtime.bigint();
const procCpuStart = process.cpuUsage();

const totalTime = performance.now() - metrics.start;
const finalMem = getResourceSnapshot();

console.log(`\n--- PERFORMANCE REPORT ---`);
console.log(`• Total Execution: ${totalTime.toFixed(0)} ms`);
console.log(`• World Spawn Latency: ${metrics.spawnTime.toFixed(0)} ms`);
console.log(`• CPU Load (World Loading): ${metrics.cpuDuringLoad}%`);

console.log(`\n--- MEMORY ANALYSIS ---`);
console.log(`• Heap Used: ${finalMem.heapUsed} MB / ${finalMem.heapTotal} MB`);
console.log(`• Memory Growth: ${(finalMem.heapUsed - (metrics.memSnapshots[0]?.heapUsed || 0)).toFixed(2)} MB since spawn`);

const world = bot.world;
const overworld = world.getDimension(bot.player.dimension);
const chunksOver = overworld.chunks;
const totalStatics = { all: 0, issues: 0 };

const players = Object.keys(world.players)

console.log(`\n--- DATA INTEGRITY TEST ---`);
console.log(`• Loaded ${chunksOver.size} chunks and ${world.plugins.BlobsManager.hashes.size} hashes, world is unique on ~${getPercent(chunksOver.size, world.plugins.BlobsManager.hashes.size).toFixed(1)}%`)
console.log(`• In view distance was ${world.entities.size - players.length} entities and ${players.length - 1} players`) // Because bot player also here`)

for (const chunk of chunksOver.values) {
    totalStatics.all++
    const { x, z } = chunk.position

    let hasProblems = !chunk.hasBiomes || !chunk.hasSubChunks
    const problems = []
    for (const y in chunk.subChunks) {
        const subChunk = chunk.subChunks[y]
        if (!subChunk.hasBlocks) problems.push(subChunk)
    }
    for (const y in chunk.biomes) {
        const biomeSection = chunk.biomes[y]
        if (!biomeSection.isEmpty) {
            biomeSection.y = y
            problems.push(biomeSection)
        }
    }

    if (hasProblems) {
        totalStatics.issues++
        console.warn(
            `[Data Loss Report] Chunk [${x}, ${z}]\n` +
            `• Biomes: ${chunk.hasBiomes ? '✓' : '✕'}\n` +
            `• SubChunks: ${chunk.hasSubChunks ? '✓' : '✕'}\n` +
            `• Issues Found: ${problems.length}`
        )

        for (const problem of problems) {
            if (problem instanceof BedrockSubChunk) {
                const { x: px, y, z: pz } = problem.position
                console.warn(`\n  - SubChunk [${x}, ${y}, ${z}], blocks: ✕`)
            }
            if (problem instanceof PalettedStorage) {
                console.warn(`\n  - BiomeSection [${x}, ${problem.y}, ${z}], biomes: ✕`)
            }
        }
    }
}

metrics.cpuDuringValidation = getCpuUsage(startHrTime, procCpuStart)
metrics.processingTime = performance.now() - procStart

console.log(`\n• Efficiency: ~${(totalStatics.all / (totalTime / 1000)).toFixed(1)} chunks/sec`);
console.log(`• Data Validation Speed: ${metrics.processingTime.toFixed(2)} ms for ${totalStatics.all} chunks`);
console.log(`• CPU Load (Validation): ${metrics.cpuDuringValidation}%`);

console.log(`• Success rate: ${(100 - getPercent(totalStatics.all, totalStatics.issues)).toFixed(2)}%`);

function getPlayerType(types) {
    if (types.host) return 'host'
    if (types.subclient) return 'subclient'
    if (types.teacher) return 'teacher'
    return 'player'
}

console.log(`\n--- Entities Data ---`)

for (const entity of world.entities.values) {
    if (entity instanceof BedrockPlayer) {
        console.log(`-- Player RuntimeId ${entity.runtimeId}, username ${entity.username}:`)
        console.log(`• Gamemode ${entity.gamemode}(${GAMEMODES.reverse[entity.gamemode]}), permission: ${entity.permission}(${PERMISSION_LEVELS.reverse[entity.permission]}), ${getPlayerType(entity.role)}.`)
        console.log(`• UUID: ${entity.uuid}, device os: ${entity.device?.os}, xboxUserId: ${entity.xuid}, ${entity?.skin ? 'have skin data.' : 'no skin data.'}`)
        console.log(`• ${Object.keys(entity.states).length} states.`)
        console.log(`• ${entity.attributes?.map?.size} attributes: ${entity.health} health, ${entity.food} food, ${entity.xp} xp.`)
        console.log(`• Physics position: ${entity.position?.x?.toFixed(1)} ${entity.position?.y?.toFixed(1)} ${entity.position?.z?.toFixed(1)}, rotation: pitch ${entity.pitch}, yaw: ${entity.yaw}`)
        continue
    }

    if (entity instanceof BedrockEntity) {
        console.log(`-- Entity RuntimeId ${entity.runtime}, type ${entity.type}:`)
        console.log(`• ${Object.keys(entity.states).length} states.`)
        console.log(`• ${entity.attributes?.map?.size} attributes: ${entity.health} health, ${entity.food} food, ${entity.xp} xp.`)
        console.log(`• Physics position: ${entity.position?.x?.toFixed(1)} ${entity.position?.y?.toFixed(1)} ${entity.position?.z?.toFixed(1)}, rotation: pitch ${entity.pitch}, yaw: ${entity.yaw}`)
        continue
    }
}