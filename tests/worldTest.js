import { DIMENSIONS } from "minetoring/extra/extraConstants"
import { sleep } from "minetoring/extra/extraFunctions"
import { V3, V3ToChunk } from "minetoring/extra/extraWorldFunctions"
import { Bot, BotOptions } from "minetoring"

const opt = new BotOptions()
const bot = new Bot()
await bot.init(opt)
await bot.connect()
await bot.waitUntilSpawn()

await sleep(10)

bot.disconnect()

const overworld = bot.world.getDimension(DIMENSIONS.overworld)
const chunk = overworld.getChunk(0, 0)

const targetCoords = V3(-15, -59, 30)
const targetChunk = V3ToChunk(targetCoords)

const block = overworld.getBlock(targetCoords.x, targetCoords.y, targetCoords.z)
console.log(block)