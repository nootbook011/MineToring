# Class: BedrockEntity inherits [BedrockPlugins](./BedrockPlugins.md)

Base class for all entities in the world.

## Contents
- [Properties](#properties)
  - [isCreated](#iscreated)
  - [metadata](#metadata)
  - [type](#type)
  - [uniqueId](#uniqueid)
  - [runtimeId](#runtimeid)
  - [position](#position)
  - [rotation](#rotation)
  - [pitch](#pitch)
  - [yaw](#yaw)
  - [roll](#roll)
  - [headYaw](#headyaw)
  - [events](#events)
  - [states](#states)
- [Dynamic Properties](#dynamic-properties)
  - [attributes](#attributes)
  - [health](#health)
  - [food](#food)
  - [xp](#xp)
- [Events](#events-1)
  - [positionChange(newPos, oldPos)](#positionchangenewpos-oldpos)
  - [rotationChange(newRot, oldRot)](#rotationchangenewrot-oldrot)
  - [attributes(new, old)](#attributesnew-old)
  - [states(new)](#statesnew)
  - [move(position, rotation)](#moveposition-rotation)
  - [despawn](#despawn)
  - [death](#death)
- [Methods](#methods)
  - [create(type, uniqueId, runtimeId = undefined)](#createtype-uniqueid-runtimeid--undefined)
  - [buildFromPacket(entityPacket)](#buildfrompacketentitypacket)
  - [updatePhysics(position?, yaw?, head_yaw?, pitch?)](#updatephysicsposition-yaw-head_yaw-pitch)
  - [setStates(statesInput)](#setstatesstatesinput)
  - [updateStatesFromPacket(packet)](#updatestatesfrompacketpacket)
- [Plugin Dependencies](#plugin-dependencies)
---

## Properties

### `isCreated`
**Type**: `boolean`

Returns `true` if the entity was successfully created via the `create()` method. Prior to calling this method, the value is `false`.

### `metadata`
**Type**: `MinecraftData.Entity`

Static entity metadata from the `minecraft-data` database corresponding to its type.

### `type`
**Type**: `string`

Entity type without the `minecraft:` prefix (e.g., `"skeleton"`).

### `uniqueId`
**Type**: `bigint`

Unique persistent ID of the entity.

### `runtimeId`
**Type**: `bigint`

Temporary network ID of the entity for the current game session.

### `position`
**Type**: `V3{ x, y, z }`

The entity's position in the world.

* **set**: If the passed value is a valid `V3` object, updates the coordinates and emits the `positionChange` event.

### `rotation`
**Type**: `V3{ x, y, z }`

The entity's rotation in space (`x` = pitch, `y` = yaw, `z` = roll).

* **set**: If the passed value is a valid `V3` object, updates the rotation angles and emits the `rotationChange` event.

### `pitch`
**Type**: `number`

Head/body pitch angle (corresponds to `rotation.x`).

### `yaw`
**Type**: `number`

Body rotation angle (corresponds to `rotation.y`).

### `roll`
**Type**: `number`

Roll angle (corresponds to `rotation.z`).

### `headYaw`
**Type**: `number`

Entity head rotation angle.

### `events`
**Type**: `EventEmitter`

Provides access to the entity's `EventEmitter` class.

### `states`
**Type**: `Object`

Current states and dynamic variables of the entity.

---

## Dynamic Properties

### `attributes`
**Type**: `BedrockAttributes`

Provides access to the entity's attributes controller. Allows retrieving and modifying specific characteristics by name.

* **Added by**: `BedrockAttributes` plugin

### `health`
**Type**: `number|undefined`

Quick access to the entity's health level.

* **Added by**: `BedrockAttributes` plugin

### `food`
**Type**: `number|undefined`

Quick access to the entity's hunger level.

* **Added by**: `BedrockAttributes` plugin

### `xp`
**Type**: `number|undefined`

Quick access to the entity's experience level.

* **Added by**: `BedrockAttributes` plugin

---

## Events

### `positionChange(newPos, oldPos)`
Fired when the entity's position changes.

**Parameters**:
- `newPos` (`V3`): The new position.
- `oldPos` (`V3`): The previous position.

### `rotationChange(newRot, oldRot)`
Fired when the entity's rotation vector changes.

**Parameters**:
- `newRot` (`V3`): The new rotation vector.
- `oldRot` (`V3`): The previous rotation vector.

### `attributes(new, old)`
Fired when the entity's attributes are updated.

**Parameters**:
- `new` (`Object`): Up-to-date attributes.
- `old` (`Object|undefined`): Previous attributes.

### `states(new)`
Fired when the entity's states are updated.

**Parameters**:
- `new` (`Object`): Up-to-date states.

### `move(position, rotation)`
Fired on a complex update of both entity position and rotation.

**Parameters**:
- `position` (`V3`): The new entity position.
- `rotation` (`Object`): The new entity rotation.

### `despawn`
Fired when the entity despawns (disappears from the bot's render distance). This event signifies either the entity's death or its departure from view distance. In either case, the class instance is considered obsolete and stops updating.

* **Death**: The entity will not reappear. It is recommended to use the `death` event for precise determination.
* **Out of view distance**: A new container class instance will be created if the entity reappears.

### `death`
Fired after the entity's in-game death in the world. After this event is triggered, the class instance is considered obsolete and stops updating.

---

## Methods

### `create(type, uniqueId, runtimeId = undefined)`
Initializes the entity with base data. Before calling this method, dependencies must be initialized via `.init()` or passed into the constructor; otherwise, an exception will be thrown.

**Parameters**:
- `type` (`string`): Entity type identifier (the `minecraft:` prefix is stripped automatically).
- `uniqueId` (`bigint`): Unique entity ID.
- `runtimeId` (`bigint|undefined`): Temporary network ID.

**Throws**: 
- `TypeError`: If dependencies were not initialized via the asynchronous `.init()` method.

### `buildFromPacket(entityPacket)`
Populates and initializes the entity using data from the `add_entity` network packet.

**Parameters**:
- `entityPacket` (`Object`): Entity spawn packet from the server.

**Returns**: `BedrockEntity` — The current updated class instance.

### `updatePhysics(position?, yaw?, head_yaw?, pitch?)`
Updates the entity's physics parameters and coordinates.

**Parameters**:
- `position` (`V3|undefined`): New position.
- `yaw` (`number|undefined`): Body rotation.
- `head_yaw` (`number|undefined`): Head rotation.
- `pitch` (`number|undefined`): Head/body pitch.

### `setStates(statesInput)`
Performs a deep update on the entity's state object.

**Parameters**:
- `statesInput` (`Object`): Object containing new states.

### `updateStatesFromPacket(packet)`
Extracts metadata from a packet and updates entity states (`states`).

**Parameters**:
- `packet` (`Object`): Network packet containing a `metadata` array.

---

## Plugin Dependencies
Base plugins are automatically loaded into the class for proper operation:
* **BedrockAttributes**: Entity characteristics manager (health, hunger, experience, etc.).