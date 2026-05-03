# Class: BedrockDimension inherits [BedrockPlugins](./BedrockPlugins.md)

The class represents a container for data of a specific game dimension (Overworld, Nether, End). It manages the grid of loaded chunks and provides an API for adding, retrieving, and validating game data.

## Contents
- [Properties](#properties)
- [Events](#events)
- [Methods](#methods)
- [Plugin Dependencies](#plugin-dependencies)

---

## Properties

### `events`
**Type**: `EventEmitter`

Provides access to the dimension's EventEmitter class.

### `chunks`
**Type**: `BedrockMap`

Returns a `BedrockMap` instance containing all loaded chunks in this dimension. Allows direct access to chunks by coordinates.

### `length`
**Type**: `number`

Returns the total number of loaded chunks in the dimension.

---

## Events

### `chunkLoaded(chunk)`
Emitted when the handler has requested all sub-chunks of this chunk from the server. Note that the event is triggered at the moment of the request rather than upon data receipt due to implementation complexity. Therefore, the actual sub-chunk data arrives with a delay after the call.

**Parameters**:
- `chunk` ([`BedrockChunk`](./BaseBedrockChunk.md)): Data of the loaded chunk.

---

## Methods

### `constructor(plugins = {})`
Creates a dimension instance.

**Parameters**:
- `plugins` (`Object`): An object containing plugins.

### `async initProtocol(protocol? = undefined)`
Initializes the class protocol data; it is not recommended to call this manually unless you know what you are doing.

**Parameters**:
- `protocol` (`BedrockProtocol|undefined`): If an existing protocol is provided, it will be initialized in the class; otherwise, it asynchronously initializes the protocol automatically based on the class's `.version` property.

### `add(packets)`
A universal method for adding world data in a single call.

**Parameters**:
- `packets` (`Object`): An object containing packets.
  - `chunk` (`Object`): `level_chunk` packet (optional).
  - `subChunks` (`Object`): `subchunk` packet (optional).

### `addChunk(levelChunkPacket)`
Parses and adds a full chunk to the dimension map.

**Parameters**:
- `levelChunkPacket` (`Object`): `level_chunk` packet from the server.

**Returns**: [`BedrockChunk`](./BaseBedrockChunk.md)

### `addSubChunks(subChunkPacket)`
Adds sub-chunk data to the dimension.

**Parameters**:
- `subChunkPacket` (`Object`): `subchunk` packet from the server.

### `getChunk(x, z)`
Returns a chunk object by its coordinates without parsing or modification.

**Parameters**:
- `x` (`number`): X coordinate of the chunk.
- `z` (`number`): Z coordinate of the chunk.

**Returns**: [`BedrockChunk`](./BaseBedrockChunk.md)|`undefined`

### `async validateChunk(x, z)`
Performs full validation and decoding of a chunk using the data adapter loaded as the `.ValidateAdapter` plugin.

**Parameters**:
- `x` (`number`): X coordinate of the chunk.
- `z` (`number`): Z coordinate of the chunk.

**Returns**: Promise<[`BedrockChunk`](./BaseBedrockChunk.md)|`false`>

### `_clear()`
Completely clears the chunk map.

---

## Plugin Dependencies

* **ValidateAdapter** (Optional): Adapter for decoding chunks (usually `PrismarineAdapter` if the dimension was automatically initialized by [`BedrockWorld`](./BaseBedrockWorld.md)).
* **BlobsManager** (Optional): Manager for chunk caching.