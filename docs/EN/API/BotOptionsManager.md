# Class: BotOptionsManager

Central configuration manager for the bot. It divides settings into logical groups (server, client, network, configuration) and prepares them for proper transmission to internal bedrock-protocol components.

## Contents
- [Getters](#getters)
  - [clientOptions](#clientoptions)
  - [options](#options)
  - [client](#client)
  - [server](#server)
  - [network](#network)
  - [config](#config)
- [Configuration Methods](#configuration-methods)
  - [constructor(options = {})](#constructoroptions--)
  - [configClient(values)](#configclientvalues)
  - [configServer(values)](#configservervalues)
  - [configNetwork(values)](#confignetworkvalues)
  - [configBotConfig(values)](#configbotconfigvalues)
---

## Getters

### `clientOptions`
**Return Type**: `Object` (bedrock-protocol compatible)

Returns an object fully compatible with the `bedrock-protocol` settings format. This getter automatically aggregates and transforms data from different blocks (server, client, network) into a single flat object for initializing the internal client.

### `options`
**Return Type**: `baseOptions` (full configuration)

Returns the complete object containing all four configuration blocks.

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

All methods use safe merging, guaranteeing that default values are preserved if no new data is provided.

### `constructor(options = {})`
Initializes the manager with specified options or default values.

**Parameters**:
- `options` (`Object`): Options object (can be partial).

### `configClient(values)`
Updates the client settings block.

**Parameters**:
- `values` (`Object`): Partial object with new client settings.

### `configServer(values)`
Updates the server settings block.

**Parameters**:
- `values` (`Object`): Object with connection parameters.

### `configNetwork(values)`
Updates network settings.

**Parameters**:
- `values` (`Object`): Object with network settings.

### `configBotConfig(values)`
Updates MineToring bot behavior configuration.

**Parameters**:
- `values` (`Object`): Object with bot parameters.