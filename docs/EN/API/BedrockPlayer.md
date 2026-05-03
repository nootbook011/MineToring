# Class: BedrockPlayer inherits [BedrockEntity](./BedrockEntity.md)

A class representing a player in the world and on the server.

## Contents
- [Properties](#properties)
- [Events](#events)
- [Methods](#methods)

---

## Properties

### `metadata`
**Type**: `Object`

An object with dynamic player metadata.
The content depends on the protocol version used by the world; [see ProtocolAPI.](./Versions/protocolAPI.md)

### `abilities`
**Type**: `Object`

An object with dynamic player abilities.

## Dynamic Properties

### `skin`
**Type**: `BedrockSkin`

Provides access to the storage of the player's skin data.

* **Adds**: `BedrockSkin`

### `dimension`
**Type**: `Number(dimensionId)`

A property that exists only in the class instance belonging to the bot. It indicates which dimension the bot is currently in and from which the current information flow originates.

* **Adds**: `ClientPacketSession`

---

## Events

### `changeGamemode(gamemode)`
Triggered when the player's game mode changes.

**Parameters**:
- `gamemode` (`Number(gamemodeId)`): The current game mode.

### `changeDimesion(dimension)`
Triggered when the player's dimension changes.

**Parameters**:
- `dimension` (`Number(dimensionId)`): The current dimension.

---

## Methods

### `setAbilities(abilitiesInput)`
Performs a deep update of abilities.

**Parameters**:
- `abilitiesInput` (`Object`): An object with updated data.