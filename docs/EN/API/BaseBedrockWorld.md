# Class: BedrockWorld inherits [BedrockPlugins](./BedrockPlugins.md)

This class is designed to manage the state of the game world. It stores global server metadata (time, game rules, etc.), tracks all entities within render distance, and serves as a container for various dimensions such as the Overworld, Nether, and End.

## Contents
- [Properties](#properties)
- [Events](#events)
- [Methods](#methods)
- [Dependency Plugins](#dependency-plugins)

---

## Properties

### `version`
**Type**: `string`

The Minecraft Bedrock version string for which the world is initialized (e.g., `'1.21.50'`).

### `registry`
**Type**: `BedrockRegistry`

Contains the class that stores local game data for the current version from the `minecraft-data` library.

### `time`
**Type**: `Number`

Returns the world time in game ticks.
* **set**: If the input is a number, it updates the time and emits the `time` event; otherwise, the update is skipped.

### `isInited`
**Type**: `boolean`

Returns `true` if the world has been successfully initialized via the `create()` method. It remains `false` until that method is called.

### `entities`
**Type**: `BedrockEntities`

Provides access to the world's entity controller, allowing for the retrieval or addition of entities to the world.

### `players`
**Type**: `Object<String: BedrockPlayer>`

Provides access to a collection of players within the bot's line of sight. Keys are usernames, and values are instances of player classes.

### `metadata`
**Type**: `Object`

An object containing dynamic world metadata. The content depends on the protocol version used by the world; [see ProtocolAPI.](./Versions/protocolAPI.md)

### `events`
**Type**: `EventEmitter`

Provides access to the world's EventEmitter instance.

## Dynamic Properties

### `gamerules`
**Type**: `BedrockGamerules`

Provides access to the world's game rules controller, allowing you to get or set specific rules by their names.

### `experiments`
**Type**: `Object`

Provides access to active world experiments.

---

## Events

### `time(newTime, oldTime)`
Fires when the world's `time` property changes.

**Parameters**:
- `newTime` (`Number`): The current updated time.
- `oldTime` (`Number`): The previous time.

### `newEntity(entity)`
Fires when a new entity appears within the bot's render distance.

**Parameters**:
- `entity` ([`BedrockEntity`](./BedrockEntity.md)): The new entity instance.

### `newPlayer(player)`
Fires when a new player appears within the bot's render distance.

**Parameters**:
- `player` ([`BedrockPlayer`](./BedrockPlayer.md)): The new player instance.

### `gamerules(newGamerules, oldGamerules)`
Fires when the world's game rules are modified.

**Parameters**:
- `newGamerules` (`Object`): The updated rules.
- `oldGamerules` (`Object`): The previous rules.

---

## Methods

### `constructor(version)`
Creates a new world instance.

**Parameters**:
- `version` (`String`): The game version (e.g., `'1.21.50'`).

### `async initProtocol(protocol? = undefined)`
Initializes the class protocol data. Manual invocation is not recommended unless you have specific requirements.

**Parameters**:
- `protocol` (`BedrockProtocol|undefined`): If an existing protocol is provided, it will be initialized; otherwise, it initializes automatically and asynchronously based on the class's `.version` property.

### `initRegistry(registry)`
Initializes the class registry data. Manual invocation is not recommended.

**Parameters**:
- `registry` (`BedrockRegistry`): The new registry data.

### `create(startGame? = undefined)`
Initializes the world structure. The protocol must be initialized via `.initProtocol` before calling this, or an exception will be thrown.

**Parameters**:
- `startGame` (`Object|undefined`): The `start_game` packet from the server.

**Throws**: 
- `TypeError`: If the protocol has not been defined via `.initProtocol`.

### `getEntity(id)`
Retrieves an entity by its identifier if it is within the bot's line of sight.

**Parameters**:
- `id` (`String|BigInt|UnsignedBigInt`): The entity's **RuntimeId** or **UniqueId**.

**Returns**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `getPlayer(username)`
Retrieves a player by their in-game username if they are within the bot's line of sight.

**Parameters**:
- `username` (`String`): The target player's username.

**Returns**: [`BedrockPlayer`](./BedrockPlayer.md)

### `addEntity(entityPacket, typeEntity? = 0, playerList? = undefined)`
Adds an entity to the world using a network packet.

**Parameters**:
- `entityPacket` (`Object`): The entity's network packet.
- `typeEntity` (`Number`): The type of entity being added.
    - 0: Entity
    - 1: Player
    - 2: Item
- `playerList` (`BedrockPlayerList|undefined`): The player list from which the parser will retrieve the player class when `typeEntity` is 1.

**Returns**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `setMetadata(metadataInput)`
Performs a deep update of the world's metadata.

**Parameters**:
- `metadataInput` (`Object`): An object containing the updated metadata.

### `getDimension(dimensionId)`
Returns a dimension object by its ID. If the dimension has not yet been created or retrieved, the class initializes it automatically.

**Parameters**:
- `dimensionId` (`Number`): The ID of the dimension.
    - 0: Overworld
    - 1: Nether
    - 2: The End

**Returns**: [`BedrockDimension`](./BaseBedrockDimension.md)