# Class: BedrockObjectStorage

A base class designed for organizing the data storage of game objects. It serves as the foundation for chunks and sub-chunks, providing a uniform interface for accessing object states and metadata.

## Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `metadata`
Returns the metadata object for the storage.

### `data`
Returns the object containing the actual storage data.

---

## Methods

### `constructor(metadata? = undefined, data? = undefined)`
Creates a new storage instance. If arguments are provided, they are automatically applied via the respective setter methods.

### `setMetadata(metadataInput)`
Recursively updates the current metadata.

**Parameters**:
- `metadataInput` (`Object`): An object containing new keys and values. Existing keys not included in the update are preserved.

### `setData(dataInput)`
Recursively updates the current stored data.

**Parameters**:
- `dataInput` (`Object`): An object containing new keys and values. Existing keys not included in the update are preserved.