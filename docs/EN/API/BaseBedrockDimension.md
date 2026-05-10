# Class: BedrockDimension inherits [BedrockPlugins](./BedrockPlugins.md)

The BedrockDimension class serves as a container for specific game dimension data (Overworld, Nether, End). It manages the grid of loaded chunks and provides an API for adding, retrieving, and validating game data.

## Contents
- [Properties](#properties)
- [Events](#events)
- [Methods](#methods)
- [Dependency Plugins](#dependency-plugins)

---

## Properties

### `events`
**Type**: `EventEmitter`

Provides access to the dimension's EventEmitter instance.

### `chunks`
**Type**: `BedrockMap`

Returns a `BedrockMap` instance containing all loaded chunks within this dimension, allowing direct access to chunks via coordinates.

### `length`
**Type**: `number`

Returns the total number of loaded chunks in the dimension.

---

## Events

### `chunkLoaded(chunk)`
Emitted when the handler requests all sub-chunks for a specific chunk from the server. Note: Due to implementation complexity, this event fires at the moment of the request rather than upon data receipt; therefore, sub-chunk data arrives with a delay after this call.

**Parameters**:
- `chunk` ([`BedrockChunk`](./BaseBedrockChunk.md)): Data of the loaded chunk.

---

## Methods

### `async initProtocol(protocol? = undefined)`
Initializes the class protocol data. Manual invocation is not recommended unless you have specific requirements.

**Parameters**:
- `protocol` (`BedrockProtocol|undefined`): If a protocol instance is provided, it will be initialized; otherwise, the protocol initializes asynchronously based on the class's `.version` property.

### `initRegistry(registry)`
Initializes the class registry data. Manual invocation is not recommended.

**Parameters**:
- `registry` (`BedrockRegistry`): New registry data.

### `add(packets)`
A universal method to add various world data in a single call.

**Parameters**:
- `packets` (`Object`): Object containing packets.
- `chunk` (`Object`, optional): A `level_chunk` packet.
- `subChunks` (`Object`, optional): A `subchunk` packet.

### `addChunk(levelChunkPacket)`
Parses and adds a full chunk to the dimension map.

**Parameters**:
- `levelChunkPacket` (`Object`): The `level_chunk` packet from the server.

**Returns**: [`BedrockChunk`](./BaseBedrockChunk.md)

### `addSubChunks(subChunkPacket)`
Adds sub-chunk data to the dimension.

**Parameters**:
- `subChunkPacket` (`Object`): The `subchunk` packet from the server.

### `getChunk(x, z)`
Retrieves a chunk object by its coordinates without parsing or modification.

**Parameters**:
- `x` (`number`): X coordinate of the chunk.
- `z` (`number`): Z coordinate of the chunk.

**Returns**: [`BedrockChunk`](./BaseBedrockChunk.md)|`undefined`

### `getBlock(x, y, z)`
Retrieves full data for a specific block within the dimension.

**Parameters**:
- `x` (`number`): X coordinate of the block.
- `y` (`number`): Y coordinate of the block.
- `z` (`number`): Z coordinate of the block.

**Throws**:
- `DimensionAccessError`: Thrown if the chunk or sub-chunk containing the block is not loaded or is corrupted.

**Returns**: [`BedrockBlock`](./BaseBedrockBlock.md)

### `getBlocks(from, to)`
Returns an iterator that traverses all coordinates within a specified range and provides full data for each block. Coordinates can be provided in any order; the function automatically identifies the minimum and maximum boundaries.

**Parameters**:
- `from` (`V3{ x, y, z }`): `V3` object representing the starting corner coordinates.
- `to` (`V3{ x, y, z }`): `V3` object representing the ending corner coordinates.

**Returns**: `BlocksAreaIterator<`[`BedrockBlock`](./BaseBedrockBlock.md)`>`

### `findBlocks(callback, from, to)`
A high-efficiency search algorithm for blocks within a world coordinate range. It passes the static `minecraft-data` of each block to a callback function; the callback must return `true` for blocks matching the search criteria.
Coordinates can be provided in any order; the function automatically identifies the minimum and maximum boundaries.

**Parameters**:
- `callback` (`(blockMetadata) => Boolean`): A function that evaluates static block metadata and returns `true` if it meets search requirements.
- `from` (`V3{ x, y, z }`): `V3` object representing the starting corner world coordinates.
- `to` (`V3{ x, y, z }`): `V3` object representing the ending corner world coordinates.

**Returns**: `BlocksIterator<`[`BedrockBlock`](./BaseBedrockBlock.md)`>`

### `_clear()`
Completely clears the chunk map.

---

## Dependency Plugins

* **BlobsManager** (Optional): Manages chunk caching mechanisms.