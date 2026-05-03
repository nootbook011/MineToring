# Class: BedrockChunk inherits [BedrockObjectStorage](./BedrockObjectStorage.md)

This class is designed for storing and processing chunk data. It supports operation in two states: **Raw** (raw packet data) and **Decoded** (decoded objects ready for block manipulation).

## Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `metadata`
**Type**: `Object`

An object containing dynamic chunk metadata.
The content depends on the protocol version used by the world; [see ProtocolAPI](./Versions/protocolAPI.md).

### `isRaw`
**Type**: `Boolean`

Returns `true` if the chunk contains only raw protocol data and has not been decoded yet.

### `hasChunk`
**Type**: `Boolean`

Checks if the chunk contains a payload.

### `hasSubChunks`
**Type**: `Boolean`

Returns `true` if at least one sub-chunk is registered in the chunk.

### `cache`
**Type**: `Boolean`

Returns the state of the chunk's cache.

### `subChunks`
**Type**: `Object<Number: BedrockSubChunks>`

Returns an object containing all sub-chunks, where the key is the `y` coordinate.

### `DChunk`
**Type**: `DecodedChunk|undefined`

Returns the decoded chunk object if `.decodeChunkWithAdapter()` was called; otherwise, `undefined`.

---

## Methods

### `async decodeChunkWithAdapter(adapter)`
The primary method for converting raw data into high-level objects.

**Parameters**:
- `adapter` (`BaseChunkAdapter`): An instance of a chunk adapter.

### `toRaw()`
Clears decoded data and reverts the chunk back to the raw data state.

### `getSubChunk(y)`
Returns a specific sub-chunk by its vertical index.

**Parameters**:
- `y` (`Number`): The Y index of the sub-chunk within the chunk.

**Returns**: [`BedrockSubChunk`](./BaseBedrockSubChunk.md)

### `setSubChunk(y, bedrockSubChunk)`
Registers a sub-chunk object within the chunk structure.

**Parameters**:
- `y` (`Number`): The Y index of the sub-chunk within the chunk.
- `bedrockSubChunk` ([`BedrockSubChunk`](./BaseBedrockSubChunk.md)): The sub-chunk class instance.

### `DSubChunk(y)`
Returns the decoded data of a specific sub-chunk.

**Parameters**:
- `y` (`Number`): The Y index of the sub-chunk within the chunk.

**Returns**: `DecodedSubChunk`