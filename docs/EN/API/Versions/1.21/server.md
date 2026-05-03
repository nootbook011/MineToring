# Server Metadata
```js
{
    host: String,
    port: Number,
    offline: Boolean,
    engine: String,
    identifier: String,
    correlationId: String,
    blockPalleteChecksum: Array<Unsigned BigInt>,
    authority: {
        movement: String,
        blocks: String,
        inventory: String,
        soundControllByServer: Boolean,
        clientSideGeneration: Boolean
    },
    settings: {
        lan: Boolean,
        xboxLiveMode: Number,
        platformMode: Number,
        chunkTickRange: Number,
        lockedBP: Boolean,
        lockedRP: Boolean,
        msaGamertags: Boolean,
        modelSkins: Boolean,
        customSkins: Boolean,
        emoteChat: Boolean,
        chatRestriction: String,
        blocksNetworkIdsHashed: Boolean
    }
}
```