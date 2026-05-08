import { DIMENSIONS } from "minetoring/extra/extraConstants"
import { getBlocksLength, V3, V3ToChunk } from "minetoring/extra/extraWorldFunctions"
import { Bot, BotOptions } from "minetoring"
import v8 from "v8";
import { getCpuUsage, getResourceSnapshot } from "./index.js";

const opt = new BotOptions()
opt.configClient({
    settings: {
        viewDistance: 15
    }
})
opt.configBotConfig({ fastLoading: true, logging: { level: 1 } })

console.log(`• Bot starting loading data from target server\n`);

const bot = new Bot()
await bot.init(opt)
await bot.connect()
await bot.waitUntilSpawn()

bot.disconnect()

console.log(`\n• Searching data..`)

const { world, player } = bot
const overworld = world.getDimension(DIMENSIONS.overworld)

const playerChunk = V3ToChunk(player.position)
const upSubChunk = overworld.getChunk(playerChunk.x + 8, playerChunk.z + 8).getSubChunk(playerChunk.y - 1)
const endSubChunk = overworld.getChunk(playerChunk.x - 8, playerChunk.z - 8).getSubChunk(-4)

const startTime = performance.now()
const startMem = getResourceSnapshot()
const startCpu = process.cpuUsage()
const startHrTime = process.hrtime.bigint();

const target = 'diamond_ore'
const blocks = overworld.findBlocks((metadata) => metadata.name?.includes(target), upSubChunk.to, endSubChunk.from)

const finalMem = getResourceSnapshot()
const finalTime = performance.now() - startTime
const finalCpu = getCpuUsage(startHrTime, startCpu)

console.log(`\n--- Test Done ---`)
console.log(`• Bot searching for ${target}.`)
console.log(`• Bot analyzed ${getBlocksLength(endSubChunk.from, upSubChunk.to)} blocks in ${finalTime.toFixed(2)} ms and found ${blocks.size} results.`)
console.log(`• Heap Used: ${finalMem.heapUsed} MB / ${finalMem.heapTotal} MB`);
console.log(`• Memory Growth: ${(finalMem.heapUsed - (startMem.heapUsed)).toFixed(2)} MB since start`);
console.log(`• CPU load ${finalCpu}%`)