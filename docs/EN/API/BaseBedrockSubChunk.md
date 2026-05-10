# Class: BedrockSubChunk inherits [BedrockObjectStorage](./BedrockObjectStorage.md)

A class for managing sub-chunk (chunk section) data. It is a component of the `BedrockChunk` structure and provides access to data for a specific vertical layer of blocks.

## Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `position`
**Type**: `V3{ x, y, z }`

Provides quick access to the sub-chunk's coordinates.

### `metadata`
**Type**: `Object`

An object containing dynamic sub-chunk metadata. The content depends on the protocol version used by the world; [see ProtocolAPI.](./Versions/protocolAPI.md)

### `hasPayload`
**Type**: `Boolean`

Indicates whether the sub-chunk contains payload data.

### `blocks`
**Type**: `Array<BedrockBlocksStorage>`

Returns an array of layers, where each layer contains the storage for all blocks within it. Typically, a sub-chunk has two layers: 
* **0**: The primary block layer.
* **1**: Contains auxiliary blocks that can exist within other blocks, such as water or snow inside fences or leaves.

### `pallete`
**Type**: `Array< Array<Number> >`

Returns an array of layers, where each layer contains a palette of `runtimeId` values for all game blocks present in the chunk storage. Blocks within `BedrockBlocksStorage` reference the indices of this array for identification.

---

## Methods

### `setPayload(payload)`
If the sub-chunk was created via a protocol parser method or the `BedrockDimension` class, this method automatically decodes the data buffer from the `subChunk` packet according to the protocol version and populates the class with data. In all other cases, this method acts as a placeholder and performs no action.

**Parameters**:
- `payload` (`Array|Buffer`): The sub-chunk payload from the `SubChunk` packet.

### `getLayer(layer)`
Returns an object containing the `blocks` and `palette` array data for a specific layer.

**Parameters**:
- `layer` (`Number`): The target data layer.

**Returns**: `{ blocks: BedrockBlocksStorage, palette: Array<Number> }`

### `setLayer(layer, blocks, palette)`
Sets the palette and block data for a specific layer.

**Parameters**:
- `layer` (`Number`): The target data layer.
- `blocks` (`BedrockBlocksStorage`): The block data for the layer.
- `palette` (`Array<Number>`): The palette data for the layer.

### `getBlockEntity(x, y, z)`
Retrieves the `EntityNbt` data for a specific block within the sub-chunk.

**Parameters**:
- `x` (`number`): Local X coordinate of the block within the sub-chunk.
- `y` (`number`): Local Y coordinate of the block within the sub-chunk.
- `z` (`number`): Local Z coordinate of the block within the sub-chunk.

**Returns**: `Object`

### `setBlockEntity(x, y, z, data)`
Sets the `EntityNbt` data for a specific block within the sub-chunk.

**Parameters**:
- `x` (`number`): Local X coordinate of the block.
- `y` (`number`): Local Y coordinate of the block.
- `z` (`number`): Local Z coordinate of the block.
- `data` (`Object`): The `EntityNbt` data for the block.

### `getBlockId(x, y, z, l)`
Returns the `runtimeId` of a block at a specific layer within the sub-chunk.

**Parameters**:
- `x` (`number`): Local X coordinate of the block.
- `y` (`number`): Local Y coordinate of the block.
- `z` (`number`): Local Z coordinate of the block.
- `l` (`number`): The target block layer.

**Returns**: `Number`

### `setBlockId(x, y, z, l, id)`
Sets the `runtimeId` of a block at a specific layer within the sub-chunk.

**Parameters**:
- `x` (`number`): Local X coordinate of the block.
- `y` (`number`): Local Y coordinate of the block.
- `z` (`number`): Local Z coordinate of the block.
- `l` (`number`): The target block layer.
- `id` (`number`): The new `runtimeId` for the block.