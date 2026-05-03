# Class: BotOptionsManager

The central configuration manager for the bot. It divides settings into logical groups (server, client, network, configuration) and prepares them for correct transmission to the internal components of the `bedrock-protocol`.

## Contents
- [Getters](#getters)
- [Configuration Methods](#configuration-methods)

---

## Getters

### `clientOptions`
**Return Type**: `Object` (bedrock-protocol compatible)

Returns an object fully compatible with the `bedrock-protocol` settings format. This getter automatically collects and transforms data from different blocks (server, client, network) into a single flat object for initializing the internal client.

### `options`
**Return Type**: `baseOptions` (full configuration)

Returns the complete object containing all four settings blocks.

### `client`
**Return Type**: `Object`

Returns the client settings block.

### `server`
**Return Type**: `Object`

Returns the server settings block.

### `network`
**Return Type**: `Object`

Returns the network settings block.

### `config`
**Return Type**: `Object`

Returns the bot configuration block.

---

## Configuration Methods

All methods use safe updating, which ensures that base default values are preserved if new data is not provided.

### `constructor(options = {})`
Initializes the manager with the given options or with default values.

**Parameters**:
- `options` (`Object`): An object with settings (can be partial).

### `configClient(values)`
Updates the client settings block.

**Parameters**:
- `values` (`Object`): A partial object with new client settings.

### `configServer(values)`
Updates the server settings block.

**Parameters**:
- `values` (`Object`): An object with connection parameters.

### `configNetwork(values)`
Updates network parameters.

**Parameters**:
- `values` (`Object`): An object with network settings.

### `configBotConfig(values)`
Updates the behavior configuration for the MineToring bot.

**Parameters**:
- `values` (`Object`): An object with bot parameters.