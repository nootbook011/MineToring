import { DIMENSIONS, PERMISSION_LEVELS } from "minetoring/extra/extraConstants"
import { getBlocksLength, V3, V3ToChunk } from "minetoring/extra/extraWorldFunctions"
import { Bot, BotOptions } from "minetoring"
import v8 from "v8";
import { getCpuUsage, getResourceSnapshot } from "./index.js";
import { sleep } from "minetoring/extra/extraFunctions";

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

if (bot.player.metadata.permission.level !== PERMISSION_LEVELS.operator) {
    bot.log('warn', `Bot cannot execute commands, waiting for operator rights..`)
    const waitPromise = new Promise((res, rej) => {
        bot.player.events.on('permissionsChange', (newPerm) => {
            if (newPerm.level === PERMISSION_LEVELS.operator) {
                bot.log('info', `Operator rights have been obtained.`)
                res()
            }
        })
    })
    await waitPromise
}

const output = await bot.actions.sendCommand('/execute in nether run tp 175 58 36')
await sleep(10000)
bot.disconnect()

console.log(`\n• Searching data..`)

const { world, player } = bot
const dimension = world.getDimension(player.dimension)

const from = V3(130, 30, 100)
const to = V3(300, 126, -60)

const startTime = performance.now()
const startMem = getResourceSnapshot()
const startCpu = process.cpuUsage()
const startHrTime = process.hrtime.bigint();

const target = 'ancient_debris'
const blocks = dimension.findBlocks((metadata) => metadata.name?.includes(target), from, to)

const finalMem = getResourceSnapshot()
const finalTime = performance.now() - startTime
const finalCpu = getCpuUsage(startHrTime, startCpu)

console.log(`\n--- Test Done ---`)
console.log(`• Bot searching for ${target}.`)
console.log(`• Bot analyzed ${getBlocksLength(from, to)} blocks in ${finalTime.toFixed(2)} ms and found ${blocks.length} results.`)
console.log(`• Heap Used: ${finalMem.heapUsed} MB / ${finalMem.heapTotal} MB`);
console.log(`• Memory Growth: ${(finalMem.heapUsed - (startMem.heapUsed)).toFixed(2)} MB since start`);
console.log(`• CPU load ${finalCpu}%`)

console.log(`\n--- First Result Data ---`)
const block = blocks.next().value
if (!block) {
    console.log(`No data.`)
    process.exit(0)
}
console.log(`Block ${block.metadata.name} on ${block.position.x} ${block.position.y} ${block.position.z} with second layer is ${block.fillBlock}`)
console.log(`Block NBT:\n${JSON.stringify(block.entityNBT, undefined, 2)}`)