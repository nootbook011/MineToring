# Class: BedrockDimension inherits [BedrockPlugins](./BedrockPlugins.md)

The class represents a data container for a specific game dimension (Overworld, Nether, End). It manages a grid of loaded chunks and provides an API for adding, retrieving, and validating game data.

## Contents
- [Properties](#properties)
  - [id](#id)
  - [events](#events)
  - [chunks](#chunks)
  - [length](#length)
- [Events](#events-1)
  - [chunkLoaded(chunk)](#chunkloadedchunk)
- [Methods](#methods)
  - [create(dimensionId? = undefined)](#createdimensionid--undefined)
  - [addChunk(chunkPacket)](#addchunkchunkpacket)
  - [addSubChunks(subChunkPacket)](#addsubchunkssubchunkpacket)
  - [getChunk(x, z)](#getchunkx-z)
  - [getBlock(x, y, z)](#getblockx-y-z)
  - [setBlock(block, x, y, z)](#setblockblock-x-y-z)
  - [getBiome(x, y, z)](#getbiomex-y-z)
  - [getBlocks(from, to)](#getblocksfrom-to)
  - [findBlocks(callBack, from, to)](#findblockscallback-from-to)
  - [_clear()](#_clear)
- [Plugin Dependencies](#plugin-dependencies)
---

## Properties

### `id`
**Type**: `number`

Returns the `dimensionId` of the target dimension.

### `events`
**Type**: `EventEmitter`

Provides access to the dimension's `EventEmitter` class.

### `chunks`
**Type**: `BedrockMap`

Returns a `BedrockMap` instance containing all loaded chunks in this dimension. Allows direct access to chunks by coordinates.

### `length`
**Type**: `number`

Returns the total number of loaded chunks in the dimension.

---

## Events

### `chunkLoaded(chunk)`
Fired when the handler requests all sub-chunks of this chunk from the server. **Note**: The event is triggered at the moment of the request rather than upon receiving data due to implementation complexity. Therefore, actual sub-chunk data arrives with a delay after the call.

**Parameters**:
- `chunk` ([`BedrockChunk`](./BedrockChunk.md)): Loaded chunk data.

---

## Methods

### `create(dimensionId? = undefined)`
Initializes the `dimensionId` of the dimension. Before calling this method, dependencies must be initialized via `.init` or passed into the constructor; otherwise, an exception will be thrown.

**Parameters**:
- `dimensionId` (`number`): Target dimension ID.

**Throws**:
- `TypeError`: If dependencies are not defined via `.init`.

### `addChunk(chunkPacket)`
Parses and adds a full chunk to the dimension map.

**Parameters**:
- `chunkPacket` (`Object`): The `level_chunk` packet from the server.

**Returns**: [`BedrockChunk`](./BedrockChunk.md)

### `addSubChunks(subChunkPacket)`
Adds sub-chunk data to the dimension.

**Parameters**:
- `subChunkPacket` (`Object`): The `subchunk` packet from the server.

### `getChunk(x, z)`
Returns a chunk object by its coordinates without parsing or modification.

**Parameters**:
- `x` (`number`): Chunk X coordinate.
- `z` (`number`): Chunk Z coordinate.

**Returns**: [`BedrockChunk`](./BedrockChunk.md)|`undefined`

### `getBlock(x, y, z)`
Returns full data of a specific block in the dimension.

**Parameters**:
- `x` (`number`): Block X coordinate.
- `y` (`number`): Block Y coordinate.
- `z` (`number`): Block Z coordinate.

**Throws**:
- `ChunkAccessError` — Thrown when the chunk or sub-chunk containing the block is not loaded or is corrupted.

**Returns**: [`BedrockBlock`](./BedrockBlock.md)


### `setBlock(block, x, y, z)`
Sets data from the [`BedrockBlock`](./BedrockBlock.md) class at the specified world coordinates.

> [!WARNING]
> This method only updates data in the local storage and does not send changes to the server!

**Parameters**:
- `block` (`BedrockBlock`): Target block class.
- `x` (`number`): Block X coordinate.
- `y` (`number`): Block Y coordinate.
- `z` (`number`): Block Z coordinate.

**Throws**:
- `ChunkAccessError` — Thrown when the chunk or sub-chunk containing the block is not loaded or is corrupted.

**Returns**: `boolean`


### `getBiome(x, y, z)`
Returns biome data at specific coordinates in the dimension.

**Parameters**:
- `x` (`number`): X coordinate.
- `y` (`number`): Y coordinate.
- `z` (`number`): Z coordinate.

**Throws**:
- `ChunkAccessError` — Thrown when the chunk or sub-chunk containing the block is not loaded or is corrupted.

**Returns**: `MinecraftData.Biome` — Target biome data from `minecraft-data`.


### `getBlocks(from, to)`
Returns an iterator that traverses all coordinates within the specified range and returns full data for each block.
Coordinates can be passed in any order — the function automatically determines the lowest and highest boundaries.

**Parameters**:
- `from` (`V3{ x, y, z }`): A `V3` object representing starting corner coordinates.
- `to` (`V3{ x, y, z }`): A `V3` object representing ending corner coordinates.

**Returns**: `BlocksAreaIterator<`[`BedrockBlock`](./BedrockBlock.md)`>`

### `findBlocks(callBack, from, to)`
A high-efficiency block search algorithm within a world coordinate range. Accepts a callback function, passing static data for each in-game block from `minecraft-data` to it. The function must return `true` for block data that matches the search criteria.
Coordinates can be passed in any order — the function automatically determines the lowest and highest boundaries.

**Parameters**:
- `callback` (`(blockMetadata) => Boolean`): A function that accepts static block metadata from `minecraft-data` and returns `true` if the block matches search requirements, or `false`/`undefined` otherwise.
- `from` (`V3{ x, y, z }`): A `V3` object representing starting corner world coordinates.
- `to` (`V3{ x, y, z }`): A `V3` object representing ending corner world coordinates.

**Returns**: `BlocksIterator<`[`BedrockBlock`](./BedrockBlock.md)`>`

### `_clear()`
Completely clears the chunk map.

---

## Plugin Dependencies

* **BlobsManager** (Optional): Chunk caching manager.