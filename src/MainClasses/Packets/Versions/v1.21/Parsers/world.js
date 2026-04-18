import { parseLi64, parseLu64 } from "#extra/extraFunctions";
import { V3 } from "#extra/extraWorldFunctions"

export default class worldParser {
    static #DIMENSIONS = { overworld: 0, nether: 1, the_end: 2 };

    static metadata(p = {}) {
        return {
            name: p.world_name || "My World",
            levelId: p.level_id || "world",
            difficulty: p.difficulty || 0,
            // 4 - Hardcore
            passedTicks: parseLi64(p.current_tick) || 0n,
            seed: { world: parseLu64(p.seed) || 0n, enchantment: parseLu64(p.enchantment_seed) || 0n },
            generator: p.generator ?? 1,
            players: {
                gamemode: p.world_gamemode || 'survival',
                permission: p.permission_level || 0,
                canPush: !p.disable_player_interactions ?? false,
                spawnpoint: {
                    base: p.spawn_position || V3(0, 0, 0),
                    actual: p.player_position || V3(0, 0, 0),
                    dimension: this.#parseDimension(p.dimension) || 0,
                }
            },
            settings: {
                spawnWithMap: p.map_enabled || false,
                bonusChest: p.bonus_chest || false,
                commands: p.enable_commands || false,
                eduFeatures: p.edu_features_enabled || false,
                gamerules: p.gamerules || [],
                experiments: p.experiments || []
            },
            worldLimited: {
                width: p.limited_world_width || null,
                length: p.limited_world_length || null
            },
        };
    }

    static #parseDimension(dim) {
        if (typeof dim === 'number') return dim;
        return this.#DIMENSIONS[dim] ?? 0;
    }
}