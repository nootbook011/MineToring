# Class: BedrockSubChunk inherits [BedrockDependencies](./BedrockDependencies.md)

Class for managing sub-chunk (chunk section) data. It is part of the parent chunk class structure and provides access to data for a specific vertical layer of blocks.

## Contents
- [Properties](#properties)
  - [position](#position)
  - [dimension](#dimension)
  - [from](#from)
  - [to](#to)
  - [hasBlocks](#hasblocks)
  - [blocks](#blocks)
- [Methods](#methods)
  - [create(x, z, dimension)](#createx-z-dimension)
  - [setPayload(payload, cache?)](#setpayloadpayload-cache)
  - [setBlocksEntityPayload(payload)](#setblocksentitypayloadpayload)
  - [getLayer(layer)](#getlayerlayer)
  - [setLayer(layer, storage)](#setlayerlayer-storage)
  - [getBlock(x, y, z)](#getblockx-y-z)
  - [setBlock(block, x, y, z)](#setblockblock-x-y-z)
  - [getBlockEntity(x, y, z)](#getblockentityx-y-z)
  - [setBlockEntity(x, y, z, data)](#setblockentityx-y-z-data)
  - [getBlockId(x, y, z, l)](#getblockidx-y-z-l)
  - [setBlockId(x, y, z, l, id)](#setblockidx-y-z-l-id)
---

## Properties

### `position`
**Type**: `V3{ x, y, z }`

Coordinates of the sub-chunk on the world chunk map and inside the parent chunk.  
**Note**: These are not world coordinates, but sub-chunk coordinates within the world chunk grid.

* **set**: If the passed value is a valid `V3{ x, y, z }` object, updates coordinate data; otherwise, skips writing.

### `dimension`
**Type**: `number`

The dimension in which the chunk is located.

### `from`
**Type**: `V3{ x, y, z }`

World coordinates of the bottom corner of the sub-chunk.

### `to`
**Type**: `V3{ x, y, z }`

World coordinates of the top corner of the sub-chunk.

### `hasBlocks`
**Type**: `boolean`

Returns `true` if at least one block is registered in the sub-chunk.

### `blocks`
**Type**: `Array<PalettedStorage>`

Returns an array of layers, each containing storage for all blocks within it. Usually a sub-chunk has only two layers:
- **0**: Main block layer.
- **1**: Contains only blocks that can exist inside other blocks (e.g., water or snow inside fences or leaves).

---

## Methods

### `create(x, z, dimension)`
Populates the sub-chunk with base data. Before calling this method, dependencies must be initialized via `.init` or passed into the constructor; otherwise, an exception will be thrown.

**Parameters**:
- `x` (`number`): X coordinate of the chunk in the world chunk grid.
- `z` (`number`): Z coordinate of the chunk in the world chunk grid.
- `dimension` (`number`): `dimensionId` of the dimension where the target chunk is located.

**Throws**:
- `TypeError`: If dependencies are not defined via `.init`.

### `setPayload(payload, cache?)`
Automatically decodes the data buffer from a `subChunk` packet and populates the class with data.

**Parameters**:
- `payload` (`Array|Buffer`): Sub-chunk payload from the `subChunk` packet.
- `cache` (`boolean`): Whether the payload was received with server data caching enabled. This is necessary because data and decoding order differ depending on whether caching is enabled or disabled. If omitted, and the parent chunk class was created using a pre-parsed packet, the method will automatically use caching settings based on that packet.

### `setBlocksEntityPayload(payload)`
Automatically decodes the data buffer from a `subChunk` packet responsible for block entity data within the sub-chunk, populating the class instance with it.

**Parameters**:
- `payload` (`Array|Buffer`): Sub-chunk payload from the `subChunk` packet.

### `getLayer(layer)`
Returns the data storage class for a specific block layer.

**Parameters**:
- `layer` (`number`): Data layer.

**Returns**: `PalettedStorage`

### `setLayer(layer, storage)`
Sets the data storage class for a specific block layer.

**Parameters**:
- `layer` (`Number`): Data layer.
- `storage` (`PalettedStorage`): Data storage class.

### `getBlock(x, y, z)`
Returns full data of a specific block in the sub-chunk.

**Parameters**:
- `x` (`number`): Local block X coordinate within the sub-chunk.
- `y` (`number`): Local block Y coordinate within the sub-chunk.
- `z` (`number`): Local block Z coordinate within the sub-chunk.

**Returns**: [`BedrockBlock`](./BedrockBlock.md)

### `setBlock(block, x, y, z)`
Sets data from a [`BedrockBlock`](./BedrockBlock.md) instance at specified local coordinates within the sub-chunk.

> [!WARNING]
> This method only updates data in the local storage and does not send changes to the server!

**Parameters**:
- `block` (`BedrockBlock`): Target block class.
- `x` (`number`): Local block X coordinate within the sub-chunk.
- `y` (`number`): Local block Y coordinate within the sub-chunk.
- `z` (`number`): Local block Z coordinate within the sub-chunk.

**Returns**: `boolean`

### `getBlockEntity(x, y, z)`
Returns `EntityNbt` data for a specific block in the sub-chunk.

**Parameters**:
- `x` (`number`): Local block X coordinate within the sub-chunk.
- `y` (`number`): Local block Y coordinate within the sub-chunk.
- `z` (`number`): Local block Z coordinate within the sub-chunk.

**Returns**: `Object`

### `setBlockEntity(x, y, z, data)`
Sets `EntityNbt` data for a specific block in the sub-chunk.

**Parameters**:
- `x` (`number`): Local block X coordinate within the sub-chunk.
- `y` (`number`): Local block Y coordinate within the sub-chunk.
- `z` (`number`): Local block Z coordinate within the sub-chunk.
- `data` (`Object`): `EntityNbt` data for the block.

### `getBlockId(x, y, z, l)`
Returns the block's `runtimeId` on a specific layer of the sub-chunk.

**Parameters**:
- `x` (`number`): Local block X coordinate within the sub-chunk.
- `y` (`number`): Local block Y coordinate within the sub-chunk.
- `z` (`number`): Local block Z coordinate within the sub-chunk.
- `l` (`number`): Target block layer.

**Returns**: `number`

### `setBlockId(x, y, z, l, id)`
Sets the block's `runtimeId` on a specific layer of the sub-chunk.

**Parameters**:
- `x` (`number`): Local block X coordinate within the sub-chunk.
- `y` (`number`): Local block Y coordinate within the sub-chunk.
- `z` (`number`): Local block Z coordinate within the sub-chunk.
- `l` (`number`): Target block layer.
- `id` (`number`): New block `runtimeId`.