# Class: BedrockChunk inherits [BedrockDependencies](./BedrockDependencies.md)

A class designed for storing and processing chunk data.

## Contents
- [Properties](#properties)
  - [position](#position)
  - [dimension](#dimension)
  - [from](#from)
  - [to](#to)
  - [hasSubChunks](#hassubchunks)
  - [hasBiomes](#hasbiomes)
  - [subChunks](#subchunks)
  - [biomes](#biomes)
- [Methods](#methods)
  - [create(x, z, dimension)](#createx-z-dimension)
  - [buildFromPacket(chunkPacket, BlobsManager? = undefined)](#buildfrompacketchunkpacket-blobsmanager--undefined)
  - [setPayload(payload, cache?)](#setpayloadpayload-cache)
  - [setBorderBlocksPayload(payload)](#setborderblockspayloadpayload)
  - [getSubChunk(y, autoCreate? = true)](#getsubchunky-autocreate--true)
  - [createSubChunk(y)](#createsubchunky)
  - [setSubChunk(y, subChunk)](#setsubchunky-subchunk)
  - [getBorder(x, z)](#getborderx-z)
  - [setBorder(x, z, boolean)](#setborderx-z-boolean)
  - [getBiome(x, y, z)](#getbiomex-y-z)
  - [getBiomeId(x, y, z)](#getbiomeidx-y-z)
  - [setBiomeId(x, y, z, id)](#setbiomeidx-y-z-id)
  - [getBlock(x, y, z)](#getblockx-y-z)
  - [setBlock(block, x, y, z)](#setblockblock-x-y-z)
  - [getBlockId(x, y, z, l)](#getblockidx-y-z-l)
  - [setBlockId(x, y, z, l, id)](#setblockidx-y-z-l-id)
---

## Properties

### `position`
**Type**: `V2{ x, z }`

Chunk coordinates on the map.  
Note: These are not world coordinates, but chunk coordinates within the world's chunk grid.

* **set**: If the input data is a valid `V2{ x, z }` object, sets the coordinates; otherwise, skips setting.

### `dimension`
**Type**: `number`

The dimension where the chunk is located.

### `from`
**Type**: `V3{ x, y, z }`

World coordinates of the bottom corner of the chunk.

### `to`
**Type**: `V3{ x, y, z }`

World coordinates of the top corner of the chunk.

### `hasSubChunks`
**Type**: `Boolean`

Returns `true` if at least one sub-chunk is registered in the chunk.

### `hasBiomes`
**Type**: `Boolean`

Returns `true` if at least one biome is registered in the chunk.

### `subChunks`
**Type**: `Object<number, BedrockSubChunks>`

Returns an object containing all sub-chunks, where the key is the `y` coordinate.

### `biomes`
**Type**: `Object<number, PalettedStorage | ProxyPalettedStorage>`

Returns an object containing all biome maps in each section of the chunk, where the key is the `y` coordinate.

---

## Methods

### `create(x, z, dimension)`
Populates the chunk with base data. Before calling, dependencies must be initialized via the `.init` method or passed into the constructor; otherwise, an exception will be thrown.

**Parameters**:
- `x` (`number`): Chunk X coordinate in the world's chunk grid.
- `z` (`number`): Chunk Z coordinate in the world's chunk grid.
- `dimension` (`number`): `dimensionId` of the dimension where the target chunk is located.

**Throws**: 
- `TypeError`: If dependencies were not defined using the `.init` method.

### `buildFromPacket(chunkPacket, BlobsManager? = undefined)`
Creates a chunk from the `level_chunk` network packet, populates the class with data, parses the payload, and automatically adds the chunk to the hash map if `BlobsManager` is provided.

**Parameters**:
- `chunkPacket` (`Object`): The `level_chunk` network packet.
- `BlobsManager` (`BlobsManager|undefined`): The hash map manager.

### `setPayload(payload, cache?)`
Automatically decodes the data buffer from the `level_chunk` network packet and populates the class with data.

**Parameters**:
- `payload` (`Array|Buffer`): Chunk payload data.
- `cache` (`boolean`): Whether the payload was received with server-side caching enabled. This is necessary because data structure and decoding order differ when caching is enabled versus disabled. If this parameter is omitted and the class was created from a prepared packet, the method will automatically read caching metadata from that chunk packet.

**Returns**: `boolean`

### `setBorderBlocksPayload(payload)`
Automatically decodes the data buffer from the `level_chunk` network packet responsible for chunk boundary/border placement and populates the parent class with border data.

**Parameters**:
- `payload` (`Array|Buffer`): Chunk payload data.

**Returns**: `boolean`

### `getSubChunk(y, autoCreate? = true)`
Returns a specific sub-chunk by its vertical index. If the sub-chunk is missing, creates a new empty sub-chunk and returns it.

**Parameters**:
- `y` (`number`): Vertical Y-index of the sub-chunk inside the chunk.
- `autoCreate` (`boolean`): If `true`, creates a new sub-chunk when requesting a non-existent one. Otherwise, returns `undefined`.

**Returns**: [`BedrockSubChunk`](./BedrockSubChunk.md)|`undefined`

### `createSubChunk(y)`
Creates a new sub-chunk based on the parent chunk's data and appends it to the chunk structure only if the Y coordinate falls within valid sub-chunk bounds for the dimension. Otherwise, returns `false`.

**Parameters**:
- `y` (`number`): Vertical Y-index of the sub-chunk inside the chunk.

**Returns**: [`BedrockSubChunk`](./BedrockSubChunk.md)|`false`

### `setSubChunk(y, subChunk)`
Registers an existing sub-chunk class instance inside the chunk structure.

**Parameters**:
- `y` (`number`): Vertical Y-index of the sub-chunk inside the chunk.
- `subChunk` ([`BedrockSubChunk`](./BedrockSubChunk.md)): Sub-chunk class instance.

### `getBorder(x, z)`
Returns `true` if local chunk coordinates contain a border restriction (for example, created by a `border_block`).

**Parameters**:
- `x` (`number`): X coordinate.
- `z` (`number`): Z coordinate.

**Returns**: `boolean`

### `setBorder(x, z, boolean)`
Updates the border status value at local chunk coordinates.

**Parameters**:
- `x` (`number`): X coordinate.
- `z` (`number`): Z coordinate.
- `boolean` (`boolean`): The new value for the coordinate.

### `getBiome(x, y, z)`
Returns biome data at specific chunk coordinates.

**Parameters**:
- `x` (`number`): X coordinate.
- `y` (`number`): Y coordinate.
- `z` (`number`): Z coordinate.

**Returns**: `MinecraftData.Biome` — Target biome data from `minecraft-data`.

### `getBiomeId(x, y, z)`
Returns the biome ID at local chunk coordinates.

**Parameters**:
- `x` (`number`): Local block X coordinate in the chunk.
- `y` (`number`): Local block Y coordinate in the chunk.
- `z` (`number`): Local block Z coordinate in the chunk.

**Returns**: `number`

### `setBiomeId(x, y, z, id)`
Sets the biome ID at local chunk coordinates.

**Parameters**:
- `x` (`number`): Local block X coordinate in the chunk.
- `y` (`number`): Local block Y coordinate in the chunk.
- `z` (`number`): Local block Z coordinate in the chunk.
- `id` (`number`): Target biome ID.

**Returns**: `number`

### `getBlock(x, y, z)`
Returns full block data for a specific block in the chunk.

**Parameters**:
- `x` (`number`): Local block X coordinate in the chunk.
- `y` (`number`): Local block Y coordinate in the chunk.
- `z` (`number`): Local block Z coordinate in the chunk.

**Returns**: [`BedrockBlock`](./BedrockBlock.md)

### `setBlock(block, x, y, z)`
Sets data from a [`BedrockBlock`](./BedrockBlock.md) class instance at the specified local chunk coordinates.

> [!WARNING]
> This method only updates data in local storage and does NOT send changes to the server!

**Parameters**:
- `block` (`BedrockBlock`): Target block class instance.
- `x` (`number`): Local block X coordinate in the chunk.
- `y` (`number`): Local block Y coordinate in the chunk.
- `z` (`number`): Local block Z coordinate in the chunk.

**Returns**: `boolean`

### `getBlockId(x, y, z, l)`
Returns the block `runtimeId` at a specific layer of the chunk.

**Parameters**:
- `x` (`number`): Local block X coordinate in the chunk.
- `y` (`number`): Local block Y coordinate in the chunk.
- `z` (`number`): Local block Z coordinate in the chunk.
- `l` (`number`): Target block layer.

**Returns**: `number`

### `setBlockId(x, y, z, l, id)`
Sets the block `runtimeId` at a specific layer of the chunk.

> [!WARNING]
> This method only updates data in local storage and does NOT send changes to the server!

**Parameters**:
- `x` (`number`): Local block X coordinate in the chunk.
- `y` (`number`): Local block Y coordinate in the chunk.
- `z` (`number`): Local block Z coordinate in the chunk.
- `l` (`number`): Target block layer.
- `id` (`number`): New block `runtimeId`.