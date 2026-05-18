import { Bot, BotOptions } from "minetoring"
import { getCpuUsage, getResourceSnapshot } from "./index.js";

const opt = new BotOptions()
opt.configClient({
    settings: {
        viewDistance: 15
    }
})
opt.configBotConfig({ fastLoading: true, logging: { level: 0 } })

console.log(`• Bot starting loading data from target server\n`);

const bot = new Bot()
await bot.init(opt)
await bot.connect()

const startTime = performance.now()
const startMem = getResourceSnapshot()
const startCpu = process.cpuUsage()
const startHrTime = process.hrtime.bigint()

await bot.waitUntilSpawn()

const done = new Promise((res) => {
    bot.actions.on('chat', (data) => {
        if (data.text === 'done') {
            bot.log(`info`, `Data loaded.`)
            res()
        }
    })
})

await done
bot.disconnect()

const finalMem = getResourceSnapshot()
const finalTime = performance.now() - startTime
const finalCpu = getCpuUsage(startHrTime, startCpu)

const { world } = bot
const [ overworld, nether, end ] = bot.world.dimensions

console.log(`\n--- Test Done ---`)
console.log(`• Data loaded in ${finalTime.toFixed(2)} ms`)
console.log(`• Dimensions loaded: ${world.dimensions.length}${overworld ? `, overworld size: ${overworld.chunks.size}` : ''}${nether ? `, nether size: ${nether.chunks.size}` : ''}${end ? `, the end size: ${end.chunks.size}` : ''}`)
console.log(`• Heap Used: ${finalMem.heapUsed} MB / ${finalMem.heapTotal} MB`)
console.log(`• Memory Growth: ${(finalMem.heapUsed - (startMem.heapUsed)).toFixed(2)} MB since start`)
console.log(`• CPU load ${finalCpu}%`)