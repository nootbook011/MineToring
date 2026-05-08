import { BasePlugin } from "#Base/BedrockStorage/moduleBase";
import { V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import World from "../Parsers/world.js";

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
        }

        for (const action in actions) {
            packets.on(action, (p) => actions[action](p))
        }
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
        const old = this.world.gamerules.object
        World.buildGamerules(this.bot.world.gamerules, p?.rules)
        this.world.events.emit('gamerules', this.world.gamerules.object, old)
    }

    difficultyChange(p) {
        this.world.metadata.difficulty = p.difficulty
    }

    commandsEnabledChange(p) {
        this.world.metadata.settings.commands = p.enabled
    }
}