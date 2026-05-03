# Class: BedrockServer inherits [BedrockPlugins](./BedrockPlugins.md)

The class is designed to manage and store information about a Minecraft Bedrock server. It stores server metadata and a full list of players on it.

## Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `metadata`
**Type**: `Object`

An object containing dynamic server metadata.
The content depends on the protocol version used by the server; [see ProtocolAPI.](./Versions/protocolAPI.md)

### `playerList`
**Type**: `BedrockPlayerList`

Provides access to the storage of all players on the server.

### `isInited`
**Type**: `boolean`

Returns `true` if the server was successfully created via the `create()` method. Returns `false` before this method is called.

## Methods

### `constructor(version)`
Creates a server instance.

**Parameters**:
- `version` (`String`): Game version (e.g., `'1.21.50'`)

### `async initProtocol(protocol? = undefined)`
Initializes the class protocol data; it is not recommended to call this manually unless you know what you are doing.

**Parameters**:
- `protocol` (`BedrockProtocol|undefined`): If an existing protocol is provided, it will be initialized in the class; otherwise, it asynchronously initializes the protocol automatically based on the class's `.version` property.

### `create(serverData, startGame? = undefined)`
Initializes the server structure. The protocol must be initialized via the `.initProtocol` method before calling this, otherwise an exception will be thrown.

**Parameters**:
- `serverData` (`Object`): An object with basic server data such as host, port, and offline state.
- `startGame` (`Object|undefined`): The `start_game` packet from the server.

**Throws**: 
- `TypeError`: If the protocol has not been defined using the `.initProtocol` method.

### `addPlayer(BedrockPlayer)`
Adds a player to the server using their class.

**Parameters**:
- `BedrockPlayer` ([`BedrockPlayer`](./BedrockPlayer.md)): The player class.

### `getPlayer(id)`
Returns a player by their identifier.

**Parameters**:
- `id` (`Unsigned BigInt|String`): The identifier used to find the player.
    - **username**
    - **uuid**
    - **uniqueId**

**Returns**: [`BedrockPlayer`](./BedrockPlayer.md)

### `setMetadata(metadataInput)`
Performs a deep update of metadata.

**Parameters**:
- `metadataInput` (`Object`): Object containing updated knowledge.