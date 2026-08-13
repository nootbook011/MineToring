# Class: BedrockServer inherits [BedrockPlugins](./BedrockPlugins.md)

The class is designed for managing and storing information about a Minecraft Bedrock server. It stores server metadata and a full list of players currently on it.

## Contents
- [Properties](#properties)
  - [version](#version)
  - [registry](#registry)
  - [events](#events)
  - [settings](#settings)
  - [playerList](#playerlist)
  - [isCreated](#iscreated)
- [Methods](#methods)
  - [constructor(version, offline = true, host = '127.0.0.1', port = 19132, registry = undefined)](#constructorversion-offline--true-host--127001-port--19132-registry--undefined)
  - [async init()](#async-init)
  - [create(startGame? = undefined)](#createstartgame--undefined)
  - [addPlayer(BedrockPlayer)](#addplayerbedrockplayer)
  - [getPlayer(id)](#getplayerid)
  - [setSettings(settingsInput)](#setsettingssettingsinput)
---

## Properties

### `version`
**Type**: `string`

Minecraft Bedrock version string for which the server is initialized (e.g., `'1.21.50'`).

### `registry`
**Type**: `BedrockRegistry`

Contains a class that stores local game data for the current version from the `minecraft-data` library.

### `events`
**Type**: `EventEmitter`

Provides access to the server's `EventEmitter` class.

### `settings`
**Type**: `Object`

An object storing server settings. Created only after calling the `.create()` method.

### `playerList`
**Type**: `BedrockPlayerList`

Provides access to the storage of all players on the server.

### `isCreated`
**Type**: `boolean`

Returns `true` if the world was successfully created via the `create()` method. Prior to calling this method, the value is `false`.

## Methods

### `constructor(version, offline = true, host = '127.0.0.1', port = 19132, registry = undefined)`
Creates a server instance.

**Parameters**:
- `version` (`String`): Game version (e.g., `'1.21.50'`).
- `offline` (`boolean`): Server status.
- `host` (`String`): Server host.
- `port` (`number`): Server port.
- `registry` (`BedrockRegistry`): Game registry.

### `async init()`
Re-initializes class dependencies. Recommended to call only if you created the class instance manually.

### `create(startGame? = undefined)`
Initializes the server structure. Before calling this method, the protocol must be initialized via `.initProtocol`; otherwise, an exception will be thrown.

**Parameters**:
- `startGame` (`Object|undefined`): The `start_game` packet from the server.

**Throws**:
- `TypeError`: If the protocol is not defined via `.initProtocol`.

### `addPlayer(BedrockPlayer)`
Adds a player to the server using their player class.

**Parameters**:
- `BedrockPlayer` ([`BedrockPlayer`](./BedrockPlayer.md)): The player class.

### `getPlayer(id)`
Returns a player by their identifier.

**Parameters**:
- `id` (`Unsigned BigInt|String`): An identifier to look up the player by:
    - **username**
    - **uuid**
    - **uniqueId**

**Returns**: [`BedrockPlayer`](./BedrockPlayer.md)

### `setSettings(settingsInput)`
Performs a deep update of the settings.

**Parameters**:
- `settingsInput` (`Object`): An object containing updated parameters.