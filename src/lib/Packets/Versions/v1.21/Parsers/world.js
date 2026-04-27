import { DIMENSIONS, GAMEMODES } from "#extra/extraConstants";
import { parseLi64, parseLu64 } from "#extra/extraFunctions";
import { V3 } from "#extra/extraWorldFunctions"
import { BedrockGamerules } from "../Modules/Gamerules.js";

export default class World {
    static metadata(p = {}) {
        return {
            name: p.world_name || "My World",
            levelId: p.level_id || "world",
            difficulty: this.#getDifficulty(p) || 0,
            passedTicks: parseLi64(p.current_tick) || 0n,
            seed: { world: p.seed.toString() || 0, enchantment: p.enchantment_seed.toString() || 0 },
            generator: p.generator ?? 1,
            players: {
                gamemode: this.#parseGamemode(p.world_gamemode) || 0,
                permission: p.permission_level || '',
                canPush: !p.disable_player_interactions ?? false,
                spawnpoint: p.spawn_position || V3(0, 0, 0),
            },
            settings: {
                achievements: !p.achievements_disabled || false,
                spawnWithMap: p.map_enabled || false,
                bonusChest: p.bonus_chest || false,
                commands: p.enable_commands || false,
                eduFeatures: p.edu_features_enabled || false,
                rpRequired: p.is_texturepacks_required || false,
            },
            worldLimited: {
                width: p.limited_world_width || null,
                length: p.limited_world_length || null
            },
        }
    }

    static buildWorld(world, startgame = undefined) {
        world.loadPlugin(new BedrockGamerules(world, startgame?.gamerules), 'gamerules')
        world.experiments = World.buildExperiments(startgame?.experiments)
    }

    static buildExperiments(experiments) {
        const result = {}
        for (const experiment of experiments) {
            result[experiment.name] = experiment.enabled
        }
        return result
    }

    static #getDifficulty(p) {
        if (p.hardcore) return 4
        return p.difficulty
    }

    static #parseGamemode(gamemode) {
        if (typeof gamemode === 'number') return gamemode;
        return GAMEMODES[gamemode] ?? 0
    }
}