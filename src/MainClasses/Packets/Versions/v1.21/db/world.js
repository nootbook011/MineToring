import { V3 } from "#extra/extraWorldFunctions"

const { x, y, z } = V3(0, 0, 0)

const metadata = {
    name: "Base Bedrock World",
    levelId: 0,
    difficulty: 0,
    passedTicks: 0,
    // 4 - Hardcore
    seed: {
        world: 0,
        enchantment: 0,
    },
    generator: 1,
    players: {
        gamemode: 0,
        permission: 0,
        canPush: false,
        //Disable Player Interactions
        spawnpoint: {
            base: { x, y, z },
            //Spawn position
            actual: { x, y, z },
            // player position
            dimension: 0,
        }
    },
    settings: {
        spawnWithMap: false,
        bonusChest: false,
        commands: true,
        eduFeatures: false,
        gamerules: [],
        experiments: [],
    },
    worldLimited: {
        isLimited: false,
        width: null,
        length: null,
    },
}

export default metadata