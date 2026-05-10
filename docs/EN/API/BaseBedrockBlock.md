# Class: BedrockBlock inherits [BedrockPlugins](./BedrockPlugins.md)

A class for storing comprehensive block data and facilitating interaction with blocks within the world.

## Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `position`
**Type**: `V3{ x, y, z }`

Provides quick access to the block's coordinates.

### `metadata`
**Type**: `Object`

An object containing static block metadata retrieved from `minecraft-data`.

### `states`
**Type**: `Object`

An object containing dynamic block states.

### `fillBlock`
**Type**: `String`

Contains a string representing the name of a block filling the current block space, such as water or snow.

### `entityNBT`
**Type**: `Object`

Contains NBT data for the block as received from the server.

---

## Methods

### `constructor(metadata, states? = undefined)`
Initializes a new instance of the block.

**Parameters**:
- `metadata` (`Object`): The block's metadata.
- `states` (`Object`, optional): The block's states.

### `addStates(registryStates)`
Adds specific states to the block.

**Parameters**:
- `registryStates` (`Object`): Block state data retrieved from `minecraft-data`.

### `addExtraLayer(blockName)`
Adds a secondary layer to the block (e.g., waterlogging).

**Parameters**:
- `blockName` (`String`): The name of the block for the second layer.

### `addEntityData(entityNbt)`
Assigns NBT data to the block.

**Parameters**:
- `entityNbt` (`Object`): The NBT data object.

### `setMetadata(metadataInput)`
Performs a deep update of the block's metadata.

**Parameters**:
- `metadataInput` (`Object`): An object containing the updated metadata information.