# Class: BedrockBlock inherits [BedrockPlugins](./BedrockPlugins.md)

A class for storing full block data and interacting with it in the world. Used as a single-use class and does not update dynamically with the block.

## Contents
- [Properties](#properties)
  - [position](#position)
  - [id](#id)
  - [runtimeId](#runtimeid)
  - [metadata](#metadata)
  - [secondLayerBlock](#secondlayerblock)
  - [states](#states)
  - [entityNBT](#entitynbt)
- [Methods](#methods)
  - [create(runtimeId = undefined, id = undefined, secondLayerBlockId? = undefined)](#createruntimeid--undefined-id--undefined-secondlayerblockid--undefined)
---

## Properties

### `position`
**Type**: `V3{ x, y, z }`

Quick access to the block's position in the world.

* **set**: If the passed value is a valid `V3` object, updates the coordinates; otherwise, returns `false`.

### `id`
**Type**: `number`

The target block's ID within the game registry.

### `runtimeId`
**Type**: `number`

Network runtime ID of the block within the server and client session.

### `metadata`
**Type**: `MinecraftData.Block`

Object containing static block metadata from the `minecraft-data` repository.

### `secondLayerBlock`
**Type**: `MinecraftData.Block`

Returns metadata of the block occupying the current block space (second layer block, e.g., water or snow).

* **set**(`secondLayerBlockId`): Sets a new game ID for the second layer block.

### `states`
**Type**: `Object`

Object containing NBT states of the current block (e.g., rotation).

### `entityNBT`
**Type**: `Object`

Object containing raw NBT data of the block entity.

* **set**: Sets a new entityNBT object for the block.

---

## Methods

### `create(runtimeId = undefined, id = undefined, secondLayerBlockId? = undefined)`
Initializes the block instance with metadata and states. Dependencies must be initialized via the `.init()` method or passed into the constructor before calling this, otherwise it will throw an exception.

**Parameters**:
- `id` (`number|undefined`): Numeric ID of the block.
- `runtimeId` (`number|undefined`): Network `runtimeId` of the block. If provided, automatically loads and sets the block's states.
- `secondLayerBlockId` (`number|undefined`): Numeric game ID for the second layer block.

> If no parameters are passed, initializes the block as `air`.

**Throws**: 
- `TypeError`: If dependencies were not initialized using the asynchronous `.init()` method.