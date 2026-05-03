# Player Metadata
```js
{
    username: String,
    uuid: String,
    gamemode: Number,
    id: {
        unique: BigInt,
        runtime: String,
        xbox: String,
        platformChat: String
    },
    permission: {
        level: Number,
        command: Number,
    },
    type: {
        host: Boolean,
        subclient: Boolean,
        teacher: Boolean
    },
    device: {
        id: String,
        os: String
    }
}
```