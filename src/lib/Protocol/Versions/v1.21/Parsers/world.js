import { DIMENSIONS, GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants";
import { parseLi64, parseLu64 } from "#extra/extraFunctions";
import { V3 } from "#extra/extraWorldFunctions"
import BedrockRegistry from "../BedrockRegistry.js";
import { BedrockGamerules } from "../Modules/Gamerules.js";

export default class World {
    static settings(p = {}) {
        return {
            name: p.world_name || "My World",
            difficulty: p.difficulty ?? 0,
            hardcore: p.hardcore,
            seed: parseLu64(p.seed) ?? 0n,
            generator: p.generator ?? 1,
            defaultGamemode: GAMEMODES[p.gamemode] ?? 0,
            defaultPermissions: PERMISSION_LEVELS[p.permission_level] ?? 0,
            spawnpoint: p.spawn_position ?? V3(0, 0, 0),
            achievements: !p.achievements_disabled ?? false,
            spawnWithMap: p.map_enabled ?? false,
            bonusChest: p.bonus_chest ?? false,
            commands: p.enable_commands ?? false,
            eduFeatures: p.edu_features_enabled ?? false,
            rpRequired: p.is_texturepacks_required ?? false,
            isMultiplayer: p.is_multiplayer ?? false,
            chunkTickRange: p.server_chunk_tick_range ?? 4,
        }
    }

    static buildWorld(world, startgame = undefined) {
        world.setSettings(World.settings(startgame))
        world.time = startgame.day_cycle_stop_time

        world.loadPlugin(new BedrockGamerules(world, startgame?.gamerules))
        world.experiments = World.buildExperiments(startgame?.experiments)
    }

    static buildExperiments(experiments) {
        const result = {}
        for (const experiment of experiments) {
            result[experiment.name] = experiment.enabled
        }
        return result
    }
}