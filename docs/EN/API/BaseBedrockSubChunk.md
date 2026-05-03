# Class: BedrockSubChunk inherits [BedrockObjectStorage](./BedrockObjectStorage.md)

A class for managing sub-chunk data (a section of a chunk). It is part of the `BedrockChunk` structure and provides access to data for a specific vertical layer of blocks.

## Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `metadata`
**Type**: `Object`

An object containing dynamic sub-chunk metadata.
The content depends on the protocol version used by the world; [see ProtocolAPI](./Versions/protocolAPI.md).

### `hasPayload`
**Type**: `Boolean`

Indicates the presence of a payload within the sub-chunk.

### `DSubChunk`
**Type**: `DecodedSubChunk|undefined`

Returns the decoded sub-chunk object if `.decodeChunkWithAdapter()` was called on the parent chunk; otherwise, `undefined`.

---

## Methods

### `_setDecodeSubChunk(decodeSubChunk)`
An internal method used by adapters to save the decoded section data.

**Parameters**:
- `decodeSubChunk` (`DecodedSubChunk`): An object containing processed block and palette data.