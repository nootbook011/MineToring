# Class: BedrockWorld inherits [BedrockPlugins](./BedrockPlugins.md)

The class is designed for managing the state of the game world. It stores global world data (time, gamerules, etc.), holds all entities within the bot's render distance, and serves as a container for various dimensions (Overworld, Nether, End).

## Contents
- [Properties](#properties)
  - [version](#version)
  - [registry](#registry)
  - [time](#time)
  - [isCreated](#iscreated)
  - [entities](#entities)
  - [players](#players)
  - [settings](#settings)
  - [events](#events)
  - [experiments](#experiments)
- [Dynamic Properties](#dynamic-properties)
  - [gamerules](#gamerules)
- [Events](#events-1)
  - [time(newTime, oldTime)](#timenewtime-oldtime)
  - [newEntity(entity)](#newentityentity)
  - [newPlayer(player)](#newplayerplayer)
  - [gamerules(newGamerules, oldGamerules)](#gamerulesnewgamerules-oldgamerules)
- [Methods](#methods)
  - [constructor(version, registry? = undefined)](#constructorversion-registry--undefined)
  - [async init()](#async-init)
  - [create(startGame? = undefined)](#createstartgame--undefined)
  - [getEntity(id)](#getentityid)
  - [getPlayer(username)](#getplayerusername)
  - [addEntity(entityPacket, typeEntity? = 0, playerList? = undefined)](#addentityentitypacket-typeentity--0-playerlist--undefined)
  - [setSettings(settingsInput)](#setsettingssettingsinput)
  - [getDimension(dimensionId)](#getdimensiondimensionid)
---

## Properties

### `version`
**Type**: `string`

Minecraft Bedrock version string for which the world is initialized (e.g., `'1.21.50'`).

### `registry`
**Type**: `BedrockRegistry`

Contains a class that stores local game data for the current version from the `minecraft-data` library.

### `time`
**Type**: `Number`

Returns world time in game ticks.

* **set**: If the passed value is a number, sets the value and emits the `time` event; otherwise, skips writing.

### `isCreated`
**Type**: `boolean`

Returns `true` if the world was successfully created via the `create()` method. Prior to calling this method, the value is `false`.

### `entities`
**Type**: `BedrockEntities`

Provides access to the world's entities controller. Allows retrieving and adding entities to the world.

### `players`
**Type**: `Object<String: BedrockPlayer>`

Provides access to the object containing players within the bot's render distance. Keys are usernames, and values are player class instances.

### `settings`
**Type**: `Object`

An object storing world settings (e.g., world name, difficulty, seed, etc.). Created only after calling the `.create()` method.

### `events`
**Type**: `EventEmitter`

Provides access to the world's `EventEmitter` class.

### `experiments`
**Type**: `Object`

Provides access to experimental world features.

## Dynamic Properties

### `gamerules`
**Type**: `BedrockGamerules`

Provides access to the world rules controller. Allows retrieving and modifying specific gamerules by name.

* **Added by**: `BedrockGamerules` plugin

---

## Events

### `time(newTime, oldTime)`
Fired when the world's `time` property changes.

**Parameters**:
- `newTime` (`Number`): Up-to-date time.
- `oldTime` (`Number`): Previous time.

### `newEntity(entity)`
Fired when a new entity appears within the bot's render distance.

**Parameters**:
- `entity` ([`BedrockEntity`](./BedrockEntity.md)): The new entity.

### `newPlayer(player)`
Fired when a new player appears within the bot's render distance.

**Parameters**:
- `player` ([`BedrockPlayer`](./BedrockPlayer.md)): The new player.

### `gamerules(newGamerules, oldGamerules)`
Fired when the world's game rules change.

**Parameters**:
- `newGamerules` (`Object`): New gamerules.
- `oldGamerules` (`Object`): Old gamerules.

---

## Methods

### `constructor(version, registry? = undefined)`
Creates a world instance.

**Parameters**:
- `version` (`String`): Game version (e.g., `'1.21.50'`).
- `registry` (`BedrockRegistry`): Existing registry instance.

### `async init()`
Re-initializes class dependencies. Recommended to call only if you created the class instance manually.

### `create(startGame? = undefined)`
Initializes the world structure. Before calling this method, dependencies must be initialized via `.init()` or passed into the constructor; otherwise, an exception will be thrown.

**Parameters**:
- `startGame` (`Object|undefined`): The `start_game` packet from the server.

**Throws**:
- `TypeError`: If dependencies were not defined via `.init()`.

### `getEntity(id)`
Returns an entity by identifier if it is within the bot's render distance.

**Parameters**:
- `id` (`String|BigInt|UnsignedBigInt`): Entity identifier:
    - **RuntimeId**
    - **UniqueId**

**Returns**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `getPlayer(username)`
Returns a player by in-game username if they are within the bot's render distance.

**Parameters**:
- `username` (`String`): Target player's in-game name.

**Returns**: [`BedrockPlayer`](./BedrockPlayer.md)

### `addEntity(entityPacket, typeEntity? = 0, playerList? = undefined)`
Adds an entity to the world from a network packet.

**Parameters**:
- `entityPacket` (`Object`): Entity network packet.
- `typeEntity` (`Number`): Type of entity being added:
    - 0: Entity
    - 1: Player
    - 2: Item
- `playerList` (`BedrockPlayerList|undefined`): Player list from which the parser takes the player class when `typeEntity = 1`.

**Returns**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `setSettings(settingsInput)`
Performs a deep update of the settings.

**Parameters**:
- `settingsInput` (`Object`): Object containing updated parameters.

### `getDimension(dimensionId)`
Returns a dimension object by its ID. If the dimension has not been created/retrieved yet, the class initializes it automatically.

**Parameters**:
- `dimensionId` (`Number`): Dimension ID:
    - 0: Overworld
    - 1: Nether
    - 2: The End

**Returns**: [`BedrockDimension`](./BedrockDimension.md)