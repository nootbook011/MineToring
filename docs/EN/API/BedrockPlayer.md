# Class: BedrockPlayer inherits [BedrockEntity](./BedrockEntity.md)

Class representing a player in the world and on the server.

## Contents
- [Properties](#properties)
  - [username](#username)
  - [uuid](#uuid)
  - [dimension](#dimension)
  - [permission](#permission)
  - [gamemode](#gamemode)
  - [abilities](#abilities)
  - [device](#device)
- [Dynamic Properties](#dynamic-properties)
  - [structure](#structure)
  - [platformChatId](#platformchatid)
  - [xuid](#xuid)
  - [role](#role)
  - [skin](#skin)
- [Events](#events)
  - [changeDimension(newDimension, oldDimension)](#changedimensionnewdimension-olddimension)
  - [changePermission(newPermission, oldPermission)](#changepermissionnewpermission-oldpermission)
  - [changeGamemode(newGamemode, oldGamemode)](#changegamemodenewgamemode-oldgamemode)
- [Methods](#methods)
  - [create(username, uniqueId, uuid = undefined, runtimeId = undefined)](#createusername-uniqueid-uuid--undefined-runtimeid--undefined)
  - [buildFromPacket(playerPacket)](#buildfrompacketplayerpacket)
  - [setAbilities(abilitiesInput)](#setabilitiesabilitiesinput)
  - [updateAbilitiesFromPacket(playerPacket)](#updateabilitiesfrompacketplayerpacket)
---

## Properties

### `username`
**Type**: `string`

The player's in-game nickname.

### `uuid`
**Type**: `string`

Unique UUID of the player.

### `dimension`
**Type**: `number`

The dimension identifier (`dimensionId`) where the player is currently located.

* **set**: Accepts a numeric ID or a string dimension name (converts using the `DIMENSIONS` dictionary). Triggers the `changeDimension` event.
* **Throws**: `TypeError` if an invalid data type is passed.

### `permission`
**Type**: `number`

The player's privilege/permission level on the server.

* **set**: Accepts a numeric ID or a string permission name (converts using the `PERMISSION_LEVELS` dictionary). Triggers the `changePermission` event.
* **Throws**: `TypeError` if an invalid data type is passed.

### `gamemode`
**Type**: `number`

The player's game mode (`gamemodeId`).

* **set**: Accepts a numeric ID or a string game mode name (converts using the `GAMEMODES` dictionary). Triggers the `changeGamemode` event.
* **Throws**: `TypeError` if an invalid data type is passed.

### `abilities`
**Type**: `Object`

An object containing the player's abilities and capabilities (flight, invulnerability, etc.).

### `device`
**Type**: `{ id: string, os: string }`

Data about the player's device (device ID and operating system). Populated when calling `buildFromPacket`.

---

## Dynamic Properties

### `structure`
**Type**: `string|undefined`

The name of the structure the player is currently inside. (This property is only present on the bot player class).

### `platformChatId`
**Type**: `string`

Unique platformChatId of the player.

* **Added by**: `packetHandler` plugin

### `xuid`
**Type**: `string`

Unique Xbox User ID of the player.

* **Added by**: `packetHandler` plugin

### `role`
**Type**: `{ host: boolean, subclient: boolean, teacher: boolean }`

The player's role on the server.

* **Added by**: `packetHandler` plugin

### `skin`
**Type**: `BedrockSkin`

Provides access to the player's skin data storage.

* **Added by**: `BedrockSkin` plugin

---

## Events

### `changeDimension(newDimension, oldDimension)`
Fired when the player's dimension changes.

**Parameters**:
- `newDimension` (`number`): The new dimension.
- `oldDimension` (`number`): The previous dimension.

### `changePermission(newPermission, oldPermission)`
Fired when the player's permission level changes.

**Parameters**:
- `newPermission` (`number`): The new permission level.
- `oldPermission` (`number`): The previous permission level.

### `changeGamemode(newGamemode, oldGamemode)`
Fired when the player's game mode changes.

**Parameters**:
- `newGamemode` (`number`): The new game mode.
- `oldGamemode` (`number`): The previous game mode.

---

## Methods

### `create(username, uniqueId, uuid = undefined, runtimeId = undefined)`
Initializes the player with base data. Before calling this method, dependencies must be initialized via `.init()` or passed into the constructor; otherwise, an exception will be thrown.

**Parameters**:
- `username` (`string`): The player's nickname.
- `uniqueId` (`bigint`): Unique entity ID.
- `uuid` (`string|undefined`): The player's UUID.
- `runtimeId` (`bigint|undefined`): Temporary network ID.

### `buildFromPacket(playerPacket)`
Populates the class using data from the player network packet (`player_list` / `add_player`).

**Parameters**:
- `playerPacket` (`Object`): Packet containing player data.

**Returns**: `BedrockPlayer` — The current updated class instance.

### `setAbilities(abilitiesInput)`
Performs a deep update on the player's abilities object (`abilities`).

**Parameters**:
- `abilitiesInput` (`Object`): Object containing updated ability parameters.

### `updateAbilitiesFromPacket(playerPacket)`
Extracts active abilities from the player network packet and updates them using `setAbilities`.

**Parameters**:
- `playerPacket` (`Object`): Packet containing an `abilities` array.