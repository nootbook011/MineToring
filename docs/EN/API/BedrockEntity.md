# Class: BedrockEntity inherits [BedrockPlugins](./BedrockPlugins.md)

The base class for all entities in the world.

## Contents
- [Properties](#properties)
- [Events](#events)
- [Methods](#methods)
- [Dependencies](#plugin-dependencies)

---

## Properties

### `metadata`
**Type**: `Object`

An object containing dynamic entity metadata. 
The content depends on the protocol version used by the world; [see ProtocolAPI.](./Versions/protocolAPI.md)

### `states`
**Type**: `Object`

The current states and variables of the entity.

### `events`
**Type**: `EventEmitter`

Provides access to the entity's EventEmitter class.

## Dynamic Properties

### `attributes`
**Type**: `BedrockAttributes`

Provides access to the entity's attribute controller. It can retrieve or modify specific attributes by their names.

* **Adds**: `BedrockAttributes`

### `health`
**Type**: `Number|undefined`

Quick access to the entity's health.

* **Adds**: `BedrockAttributes`

### `food`
**Type**: `Number|undefined`

Quick access to the entity's hunger.

* **Adds**: `BedrockAttributes`

### `xp`
**Type**: `Number|undefined`

Quick access to the entity's level.

* **Adds**: `BedrockAttributes`

### `physics`
**Type**: `BedrockPhysicsManager`

Provides access to the entity's physical state controller. It is not recommended to modify any values within it.

* **Adds**: `BedrockPhysicsManager` plugin

### `position`
**Type**: `V3{ x, y, z }`

Quick access to the entity's position.

* **Adds**: `BedrockPhysicsManager` plugin

### `rotation`
**Type**: `{ pitch, yaw: { all, body, head }`

Quick access to the entity's rotation.

* **Adds**: `BedrockPhysicsManager` plugin

---

## Events

### `attributes(new, old)`
Fires when the entity's attributes are updated.

**Parameters**:
- `new` (`Object`): current attributes.
- `old` (`Object|undefined`): outdated attributes.

### `states(new)`
Fires when the entity's states are updated.

**Parameters**:
- `new` (`Object`): current states.

### `move(position, rotation)`
Fires when the entity's position and rotation are updated.

**Parameters**:
- `position` (`V3{ x, y, z }`): The new position of the entity.
- `rotation` (`{ pitch, yaw: { all, body, head }`): The new rotation of the entity.

### `despawn`
Fires when an entity despawns (disappears from the bot's view distance). This means either the entity died or it moved out of the bot's render distance. In either case, this entity class instance is considered obsolete and will not be updated after this event is triggered.

**Values**: 
- **Death**: The entity will not reappear and will not be updated. For precise determination, it is recommended to use the `death` event.
- **Moving out of render distance**: An entity with the same data may reappear with a new entity class instance.

### `death`
Fires after the entity's in-game death in the world. After this event is triggered, this entity class instance is considered obsolete and will not be updated.

---

## Methods

### `setMetadata(metadataInput)`
Performs a deep update of metadata.

**Parameters**:
- `metadataInput` (`Object`): Object containing updated knowledge.

### `setStates(statesInput)`
Performs a deep update of states.

**Parameters**:
- `statesInput` (`Object`): Object containing updated knowledge.

---

## Plugin Dependencies
Base plugins are loaded into the class for proper operation.
* **BedrockAttributes**: Entity characteristic manager (health, hunger, movement speed, etc.).
* **BedrockPhysicsManager**: Responsible for the entity's spatial and physical data: coordinates, rotation angles, and hitboxes.

For plugin class documentation, see [this file.](./Versions/protocolAPI.md)