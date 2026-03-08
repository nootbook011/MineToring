import { parseBigInt } from "#extra/extraWorldFunctions";

export default class startGameParser {
    static #DIMENSIONS = { overworld: 0, nether: 1, the_end: 2 };

    static toWorldMetadata(p) {
        return {
            name: p.world_name,
            levelId: p.level_id,
            difficulty: p.difficulty,
            passedTicks: parseBigInt(p.current_tick),
            seed: { world: parseBigInt(p.seed), enchantment: parseBigInt(p.enchantment_seed) },
            generator: p.generator,
            players: {
                gamemode: p.world_gamemode,
                permission: p.permission_level,
                canPush: !p.disable_player_interactions,
                spawnpoint: {
                    base: p.spawn_position,
                    actual: p.player_position,
                    dimension: this.#parseDimension(p.dimension),
                }
            },
            settings: {
                spawnWithMap: p.map_enabled,
                bonusChest: p.bonus_chest,
                commands: p.enable_commands,
                eduFeatures: p.edu_features_enabled,
                gamerules: p.gamerules,
                experiments: p.experiments
            },
            worldLimited: {
                isLimited: p.limited_world_width !== 0 && p.limited_world_length !== 0,
                width: p.limited_world_width,
                length: p.limited_world_length
            },
        };
    }

    static #parseDimension(dim) {
        if (typeof dim === 'number') return dim;
        return this.#DIMENSIONS[dim] ?? 0;
    }
}