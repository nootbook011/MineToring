# Class: BedrockChunk inherits [BedrockObjectStorage](./BedrockObjectStorage.md)

A class designed for storing and processing chunk data.

## Table of Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `position`
**Type**: `V3{ x, y, z }`

Provides quick access to the chunk's coordinates.

### `metadata`
**Type**: `Object`

An object containing dynamic chunk metadata.  
The contents depend on the protocol version used by the world; [see ProtocolAPI.](./Versions/protocolAPI.md)

### `hasPayload`
**Type**: `Boolean`

Indicates whether the chunk contains payload data.

### `hasSubChunks`
**Type**: `Boolean`

Returns `true` if at least one sub-chunk is registered within the chunk.

### `cache`
**Type**: `Boolean`

Returns the current state of the chunk's cache.

### `subChunks`
**Type**: `Object<Number: BedrockSubChunks>`

Returns an object containing all sub-chunks, where the key represents the `y` coordinate.

---

## Methods

### `setPayload(payload)`
If the chunk was created via a protocol parser method or the `BedrockDimension` class, this method automatically decodes the data buffer from the `level_chunk` packet according to the protocol version and populates the class with data. In all other cases, this method acts as a placeholder and performs no action.

**Parameters**:
- `payload` (`Array|Buffer`): The chunk's payload data.

### `getBlockId(x, y, z, l)`
Returns the `runtimeId` of a block at a specific layer within the chunk.

**Parameters**:
- `x` (`number`): Local X coordinate of the block within the chunk.
- `y` (`number`): Local Y coordinate of the block within the chunk.
- `z` (`number`): Local Z coordinate of the block within the chunk.
- `l` (`number`): The target block layer.

**Returns**: `Number`

### `setBlockId(x, y, z, l, id)`
Sets the `runtimeId` of a block at a specific layer within the chunk.

**Parameters**:
- `x` (`number`): Local X coordinate of the block within the chunk.
- `y` (`number`): Local Y coordinate of the block within the chunk.
- `z` (`number`): Local Z coordinate of the block within the chunk.
- `l` (`number`): The target block layer.
- `id` (`number`): The new `runtimeId` for the block.

### `getSubChunk(y)`
Retrieves a specific sub-chunk by its vertical index.

**Parameters**:
- `y` (`Number`): The Y index of the sub-chunk within the chunk.

**Returns**: [`BedrockSubChunk`](./BaseBedrockSubChunk.md)

### `setSubChunk(y, bedrockSubChunk)`
Registers a sub-chunk object into the chunk structure.

**Parameters**:
- `y` (`Number`): The Y index of the sub-chunk within the chunk.
- `bedrockSubChunk` ([`BedrockSubChunk`](./BaseBedrockSubChunk.md)): The sub-chunk class instance.