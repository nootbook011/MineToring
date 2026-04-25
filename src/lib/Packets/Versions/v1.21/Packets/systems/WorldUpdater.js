import { BasePlugin } from "#Base/BedrockStorage/moduleBase";

export class WorldUpdater extends BasePlugin {
    get world() { return this.bot.world }

    WorldUpdateLoop() {
        const packets = this.bot.packets
        const actions = {
            'set_time': this.setTime.bind(this),
            'game_rules_changed': this.gamerulesChange.bind(this),
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
        this.world.events('gamerules', this.world.gamerules.object, old)
    }
}