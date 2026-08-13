# Class: BaseBedrockBot inherits [BedrockPlugins](./BedrockPlugins.md)

The core of the MineToring framework, responsible for client initialization, session management, protocol versions, and bot lifecycle. The class provides a full connection cycle to a Minecraft Bedrock server, including status handling, version synchronization, and plugin management.

## Contents
- [Bot Statuses](#bot-statuses)
- [Properties](#properties)
  - [options](#options)
  - [username](#username)
  - [status](#status)
  - [version](#version)
  - [client](#client)
  - [session](#session)
- [Dynamic Properties](#dynamic-properties)
  - [packets](#packets)
- [Methods](#methods)
  - [async init(options, plugins? = [])](#async-initoptions-plugins--)
  - [async connect()](#async-connect)
  - [disconnect()](#disconnect)
  - [async ping()](#async-ping)
  - [log(type, message, logLevel? = -1)](#logtype-message-loglevel---1)
- [Wait Methods](#wait-methods)
---

## Bot Statuses
Available via the static getter `BaseBedrockBot.statusList` and via importing `BOTSTATES` from `extraConstants`.

| Constant | Value | Description |
| :--- | :--- | :--- |
| `NotInitialized` | `0` | The bot is created, but the `init()` method has not been called yet. |
| `Disconnected` | `1` | The bot is initialized and ready to connect, or disconnected from the server. |
| `Connecting` | `2` | The process of establishing a connection to the server and loading initial server data. |
| `Spawned` | `3` | The bot has successfully spawned in the world and is ready for interaction. |

---

## Properties

### `options`
**Type**: [`BotOptionsManager`](./BotOptionsManager.md)

Bot configuration object containing server, client, and network settings. Initialized in the `init()` method.

* **set**: If given a `BotOptionsManager` instance, sets the value directly. If given an object, attempts to instantiate a `BotOptionsManager` and set it.

### `username`
**Type**: `string`

The current username of the bot on the server.

### `status`
**Type**: `number`

Returns the current numeric status of the bot (0-3). Use `BaseBedrockBot.statusList` to get status names.

### `version`
**Type**: `string`

The current Minecraft Bedrock version used by the bot (e.g., `'1.21.50'`). Synchronized during initialization by pinging the server, or uses the value from the configuration.

### `client`
**Type**: `CustomPClient`

Low-level bot client. Modifying any values within it is not recommended without knowing what they are responsible for.

### `session`
**Type**: `object`

Returns a copy of the current session data (UUID, XUID, PlayFab ID). Data from this session is preserved across reconnects.
[Session Documentation.](../ClientSessions.md)

## Dynamic Properties

### `packets`
**Type**: `BotPacketController`

Provides access to the low-level packet controller. Can listen to and send packets to the server.

* **Adds**: `BotPacketController`

---

## Methods

### `async init(options, plugins? = [])`
The main method for preparing the bot. Performs version synchronization, internal component initialization, and plugin loading.

**Parameters**:
- `options` (`BotOptionsManager|Object`): Bot configuration. If an object is passed, it will be converted to `BotOptionsManager`.
- `plugins` (`Array`): An array of custom bot plugins.

### `async connect()`
Starts the connection process to the server.

**Throws**: `RakTimeout` if the server does not respond to ping, only when the `pingBeforeConnect` option is enabled in the bot settings.

### `disconnect()`
Gracefully disconnects from the server.

### `async ping()`
Pings the server to retrieve information about it or check availability.

### `log(type, message, logLevel? = -1)`
Logs a message to the console and file via the class's `Logger` plugin.

**Parameters**:
- `type` (`string`): Log category.
  - 0: debug.
  - 1: info.
  - 2: warn.
  - 3: error.
- `message` (`string`): Message text.
- `logLevel` (`number`): Logging level.
---

## Wait Methods
Useful for synchronizing logic during bot startup.

| Method | Description |
| :--- | :--- |
| `async waitUntilInit()` | Resolves when `init()` is completed and status >= `Disconnected`. |
| `async waitUntilConnect()` | Resolves when status >= `Connecting`. Rejects on sudden disconnection. |
| `async waitUntilSpawn()` | Resolves when status === `Spawned`. Rejects on sudden disconnection. |
| `async waitUntilDisconnect()` | Resolves when status <= `Disconnected`. |

---