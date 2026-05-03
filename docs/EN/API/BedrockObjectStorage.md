# Class: BedrockObjectStorage

A base class for organizing the data storage of game objects. It is used as a foundation for chunks and sub-chunks, providing a uniform interface for accessing the object's state and its metadata.

## Contents
- [Storage Structure](#storage-structure)
- [Properties](#properties)
- [Data Update Methods](#data-update-methods)

---

## Storage Structure

Each object inheriting from `BedrockObjectStorage` has an internal structure divided into three parts:
1. **Metadata**: Descriptive data (coordinates, cache keys, etc.).
2. **Data Raw**: "Raw" data received directly from network packets or a database.
3. **Data Decoded**: Processed data (e.g., `prismarine-chunk` objects) ready for use in bot logic.

---

## Properties

### `metadata`
Returns the storage metadata object.

### `data`
Returns an object containing two nested objects: `raw` and `decoded`.

### `static base` (getter)
A static property that returns a template of an empty storage structure.

---

## Data Update Methods

### `constructor(metadata? = undefined, data? = undefined)`
Creates a storage instance. If arguments are passed, they are automatically applied via the corresponding setter methods.

### `setMetadata(metadataInput)`
Recursively updates the current metadata.
* **metadataInput**: An object with new keys and values. Existing keys not affected by the update are preserved.

### `setData(rawDataInput)`
Sets new "raw" data and **completely resets** the current decoded data. This ensures that when a network packet is updated, the old (outdated) interpretation of the data is removed.
* **rawDataInput**: An object with new raw data.

### `_setDataDecoded(decodedDataInput)`
An internal method (intended for adapters) to record parsing results. Unlike `setData`, this method does not reset other fields but supplements the `decoded` object instead.

---

## Technical Details

The class uses a helper function `recurseUpdate`, which allows for deep object updates. This is convenient when you need to update only a single field in a complex metadata object without overwriting the entire object.