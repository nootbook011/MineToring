# Class: BedrockWorld inherits [BedrockPlugins](./BedrockPlugins.md)

The class is designed to manage the state of the game world. It stores global server metadata (time, game rules, etc.), keeps track of all entities within render distance, and serves as a container for various dimensions (Overworld, Nether, End).

## Contents
- [Properties](#properties)
- [Events](#events)
- [Methods](#methods)
- [Plugin Dependencies](#plugin-dependencies)

---

## Properties

### `version`
**Type**: `string`

The Minecraft Bedrock version string for which the world is initialized (e.g., `'1.21.50'`).

### `time`
**Type**: `Number`

Returns the world time in game ticks.

* **set**: If the input data is a number, it sets the value and triggers the `time` event; otherwise, it skips the write operation.

### `isInited`
**Type**: `boolean`

Returns `true` if the world was successfully created via the `create()` method. Returns `false` before this method is called.

### `entities`
**Type**: `BedrockEntities`

Provides access to the world's entity controller. It can retrieve or add entities to the world.

### `players`
**Type**: `Object<String: BedrockPlayer>`

Provides access to a convenient object of players within the bot's view distance. Keys are usernames and values are instances of player classes.

### `metadata`
**Type**: `Object`

An object containing dynamic world metadata.
The content depends on the protocol version used by the world; [see ProtocolAPI.](./Versions/protocolAPI.md)

### `events`
**Type**: `EventEmitter`

Provides access to the world's EventEmitter class.

## Dynamic Properties

### `gamerules`
**Type**: `BedrockGamerules`

Provides access to the world's rules controller. It can get or change specific rules by their names.

* **Adds**: `BedrockGamerules`

### `experiments`
**Type**: `Object`

Provides access to world experiments.

* **Adds**: `BedrockWorld`

---

## Events

### `time(newTime, oldTime)`
Fires when the world's `time` property changes.

**Parameters**:
- `newTime` (`Number`): The current time.
- `oldTime` (`Number`): The previous time.

### `newEntity(entity)`
Fires when a new entity appears within the bot's render distance.

**Parameters**:
- `entity` ([`BedrockEntity`](./BedrockEntity.md)): The new entity.

### `newPlayer(player)`
Fires when a new player appears within the bot's render distance.

**Parameters**:
- `player` ([`BedrockPlayer`](./BedrockPlayer.md)): The new player.

### `gamerules(newGamerules, oldGamerules)`
Fires when the world's game rules are changed.

**Parameters**:
- `newGamerules` (`Object`): The new rules.
- `oldGamerules` (`Object`): The old rules.

---

## Methods

### `constructor(version, plugins = {})`
Creates a world instance.

**Parameters**:
- `version` (`String`): Game version (e.g., `'1.21.50'`)
- `plugins` (`Object`): Object containing plugins.

### `async initProtocol(protocol? = undefined)`
Initializes the class protocol data; it is not recommended to call this manually unless you know what you are doing.

**Parameters**:
- `protocol` (`BedrockProtocol|undefined`): If an existing protocol is provided, it will be initialized in the class; otherwise, it asynchronously initializes the protocol automatically based on the class's `.version` property.

### `create(startGame? = undefined)`
Initializes the world structure. The protocol must be initialized via the `.initProtocol` method before calling this, otherwise an exception will be thrown.

**Parameters**:
- `startGame` (`Object|undefined`): The `start_game` packet from the server.

**Throws**: 
- `TypeError`: If the protocol has not been defined using the `.initProtocol` method.

### `getEntity(id)`
Returns an entity by its identifier.

**Parameters**:
- `id` (`String|BigInt|UnsignedBigInt`): The entity identifier.
    - **RuntimeId**
    - **UniqueId**

**Returns**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `addEntity(entityPacket, typeEntity? = 0, playerList? = undefined)`
Adds an entity to the world from a network packet.

**Parameters**:
- `entityPacket` (`Object`): The entity network packet.
- `typeEntity` (`Number`): The type of entity being added.
    - 0: Entity
    - 1: Player
    - 2: Item
- `playerList` (`BedrockPlayerList|undefined`): The player list from which the parser will retrieve the player class when `typeEntity = 1`.

**Returns**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `setMetadata(metadataInput)`
Performs a deep update of metadata.

**Parameters**:
- `metadataInput` (`Object`): Object containing updated knowledge.

### `getDimension(dimensionId)`
Returns a dimension object by its ID. If the dimension hasn't been created/retrieved yet, the class initializes it automatically.

**Parameters**:
- `dimensionId` (`Number(dimensionId)`): Dimension ID.
    - 0: Overworld.
    - 1: Nether.
    - 2: The End.

**Returns**: [`BedrockDimension`](./BaseBedrockDimension.md)

---

## Plugin Dependencies

* **ValidateAdapter** (Optional): A data adapter (usually `PrismarineAdapter`) that converts Bedrock world packets into a convenient format.