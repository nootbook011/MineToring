import { BasePlugin } from "#Base/BedrockStorage/moduleBase";

export class WorldHandler extends BasePlugin {
    get world() { return this.bot.world }

    startWorldUpdate() {
        const packets = this.bot.packets
        const actions = {
            'set_time': this.setTime.bind(this),
            'game_rules_changed': this.gamerulesChange.bind(this),
            'set_difficulty': this.difficultyChange.bind(this),
            'set_commands_enabled': this.commandsEnabledChange.bind(this),
        }

        for (const action in actions) {
            packets.on(action, (p) => actions[action](p))
        }
    }

    setTime(p) {
        this.world.time = p.time
    }

    gamerulesChange(p) {
        const old = this.world.gamerules.object
        this.world?.plugins?.BedrockGamerules?.buildFromPacket(p?.rules)
        this.world.events.emit('gamerules', this.world.gamerules.object, old)
    }

    difficultyChange(p) {
        this.world.metadata.difficulty = p.difficulty
    }

    commandsEnabledChange(p) {
        this.world.metadata.settings.commands = p.enabled
    }
}