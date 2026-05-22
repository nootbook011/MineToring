import { BasePlugin } from "#Storage/moduleBase";
import { V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";

export class WorldHandler extends BasePlugin {
    get world() { return this.bot.world }

    startWorldUpdate() {
        const packets = this.bot.packets
        const actions = {
            'set_time': this.setTime.bind(this),
            'game_rules_changed': this.gamerulesChange.bind(this),
            'set_difficulty': this.difficultyChange.bind(this),
            'set_commands_enabled': this.commandsEnabledChange.bind(this),
            'update_block': this.updateBlock.bind(this),
            'block_entity_data': this.updateBlockNbt.bind(this),
        }

        for (const action in actions) {
            packets.on(action, (p) => actions[action](p))
        }
    }

    updateBlockNbt(p) {
        const { position, nbt } = p
        const chunkPos = V3ToChunk(position)
        const local = V3WorldToLocal(position)

        const chunk = this.world.getDimension(this.bot.player.dimension).getChunk(chunkPos.x, chunkPos.z)
        const subChunk = chunk?.getSubChunk(chunkPos.y)
        if (!subChunk) return

        subChunk.setBlockEntity(local.x, local.y, local.z, nbt)
    }

    updateBlock(p) {
        const { position, block_runtime_id, layer } = p
        const chunkPos = V3ToChunk(position)
        const local = V3WorldToLocal(position)

        const chunk = this.world.getDimension(this.bot.player.dimension).getChunk(chunkPos.x, chunkPos.z)
        const subChunk = chunk?.getSubChunk(chunkPos.y)
        if (!subChunk) return

        subChunk.setBlockId(local.x, local.y, local.z, layer, block_runtime_id)
    }

    setTime(p) {
        this.world.time = p.time
    }

    gamerulesChange(p) {
        this.world.gamerules.update(p?.rules)
    }

    difficultyChange(p) {
        this.world.settings.difficulty = p.difficulty
    }

    commandsEnabledChange(p) {
        this.world.settings.commands = p.enabled
    }
}