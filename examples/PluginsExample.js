import { BotOptions, Bot, Player } from "minetoring";
import { BasePlugin } from "minetoring/BasePlugin";

class MyPlugin extends BasePlugin {
    getNearEntity() {
        const playerPos = this.bot.player.position
        const entities = this.bot.world.entities.values

        let lastEntityDistance = Infinity
        let lastEntity = null

        for (const entity of entities) {
            if (entity?.username === this.bot.player.username) continue

            const entityDistance = this.#getDistance(playerPos, entity.position)

            if (entityDistance < lastEntityDistance) {
                lastEntityDistance = entityDistance
                lastEntity = entity
            }
        }

        return lastEntity
    }

    #getDistance(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;

        return dx * dx + dy * dy + dz * dz;
    }

}

const options = new BotOptions()
const bot = new Bot()
await bot.init(options, [MyPlugin])

await bot.connect()
await bot.waitUntilSpawn()

function getNearbyEntity() {
    const nearEntity = bot.plugins.MyPlugin.getNearEntity()
    if (!nearEntity) bot.actions.sendMessage('There are no nearby entities.')
    const { x, y, z } = nearEntity.position

    bot.actions.sendMessage(`Nearby entity found! Is ${nearEntity.type === 'player' ? nearEntity.username : nearEntity.type}, position ${Math.round(x)} ${Math.round(y)} ${Math.round(z)}`)
}

bot.actions.on('chat', (data) => {
    if (data.text === '!nearEntity') getNearbyEntity()
    if (data.text === '!exit') bot.disconnect() 
})