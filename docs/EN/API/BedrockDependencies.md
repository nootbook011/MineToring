# Class: BedrockDependencies

Base class for dependency initialization.

## Contents
- [Properties](#properties)
  - [registry](#registry)
- [Methods](#methods)
  - [constructor(registry? = undefined)](#constructorregistry--undefined)
  - [async init(version)](#async-initversion)
---

## Properties

### `registry`
**Type**: `BedrockRegistry|undefined`

Contains the game registry class for the selected version if it was initialized via the constructor or the `.init` method; otherwise, contains `undefined`.

* **set**: Sets a new `BedrockRegistry` class.

---

## Methods

### `constructor(registry? = undefined)`
Sets existing dependencies within the class.

**Parameters**:
- `registry` (`BedrockRegistry|undefined`): The game registry class.

### `async init(version)`
Initializes new dependencies within the class.

**Parameters**:
- `version` (`string`): The game version for which dependencies will be created.