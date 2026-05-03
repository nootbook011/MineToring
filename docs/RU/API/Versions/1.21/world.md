# World Metadata
```js
{
    name: String,
    levelId: String,
    difficulty: Number,
    passedTicks: BigInt,
    seed: {
        world: String,
        enchantment: String
    },
    generator: Number,
    players: {
        gamemode: Number,
        permission: String,
        canPush: Boolean,
        spawnpoint: V3{ x, y, z }
    },
    settings: {
        achievements: Boolean,
        spawnWithMap: Boolean,
        bonusChest: Boolean,
        commands: Boolean,
        eduFeatures: Boolean,
        rpRequired: Boolean
    },
    worldLimited: {
        width: Number,
        length: Number
    }
}
```