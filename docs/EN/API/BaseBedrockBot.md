# Class: BaseBedrockBot inherits [BedrockPlugins](./BedrockPlugins.md)

The core of the MineToring framework, responsible for client initialization, session management, protocol versions, and the bot's lifecycle. This class provides the full cycle of connecting to a Minecraft Bedrock server, including status handling, version synchronization, and plugin management.

## Contents
- [Bot Statuses](#bot-statuses)
- [Properties](#properties)
- [Methods](#methods)
- [Wait Methods](#wait-methods)

---

## Bot Statuses
Available via the static getter `BaseBedrockBot.statusList` and via the `BOTSTATES` import from `extraConstants`.

| Constant | Value | Description |
| :--- | :--- | :--- |
| `NotInitialized` | `0` | The bot is created, but the `init()` method has not been called yet. |
| `Disconnected` | `1` | The bot is initialized and ready to connect, or disconnected from the server. |
| `Connecting` | `2` | The process of establishing a connection with the server and loading initial server data. |
| `Spawned` | `3` | The bot has successfully spawned in the world and is ready for interaction. |

---

## Properties

### `options`
**Type**: [`BotOptionsManager`](./BotOptionsManager.md)

The bot configuration object containing server, client, and network settings. Initialized in the `init()` method.

* **set**: If it is an instance of `BotOptionsManager`, it sets the value; if it is an object, it attempts to create a `BotOptionsManager` instance and set it.

### `username`
**Type**: `string`

The current username of the bot on the server.

### `status`
**Type**: `number`

Returns the current numerical status of the bot (0-3). Use `BaseBedrockBot.statusList` to retrieve status names.

### `version`
**Type**: `string`

The current Minecraft Bedrock version used by the bot (e.g., `'1.21.50'`). Synchronized during initialization by pinging the server or using a value from the configuration.

### `client`
**Type**: `CustomPClient`

The low-level bot client; it is not recommended to modify any values within it without knowledge of their function.

### `session`
**Type**: `object`

Returns a copy of the current session data (UUID, XUID, PlayFab ID). Data from this session is preserved between reconnections.
[Session Documentation.](../ClientSessions.md)

### `protocol`
**Type**: `BedrockProtocol`

Returns the current protocol instance of the bot.

## Dynamic Properties

### `packets`
**Type**: `BotPacketController`

Provides access to the low-level packet controller. Can listen for and send packets to the server.

* **Adds**: `BotPacketController`

---

## Methods

### `async init(options, plugins = {})`
The primary method for preparing the bot. Performs version synchronization, initialization of internal components, and plugin loading.

**Parameters**:
- `options` (`BotOptionsManager|Object`): Bot configuration. If an object is passed, it will be converted to `BotOptionsManager`.
- `plugins` (`Object`): An object with custom plugin dependencies. May contain:
  - `clientSession` (`ClientPacketSession`): The bot's session controller.
  - `packets` (`BotPacketController`): The packet controller.
  - `plugins` (`Array|Object`): Additional plugins to load.

### `async initProtocol(protocol? = undefined)`
Initializes the class protocol data; it is not recommended to call this manually unless you know what you are doing.

**Parameters**:
- `protocol` (`BedrockProtocol|undefined`): If an existing protocol is provided, it will be initialized in the class; otherwise, it asynchronously initializes the protocol automatically based on the class's `.version` property.

### `async connect()`
Starts the connection process to the server.

**Throws**: `RakTimeout` if the server does not respond to a ping, only when the `pingBeforeConnect` parameter is enabled in the bot settings.

### `disconnect()`
Gracefully terminates the connection with the server.

### `async ping()`
Pings the server to retrieve information about it or to check availability.

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
| `async waitUntilInit()` | Resolves when `init()` is complete and status is >= `Disconnected`. |
| `async waitUntilConnect()` | Resolves when status is >= `Connecting`. Rejects upon sudden disconnection. |
| `async waitUntilSpawn()` | Resolves when status === `Spawned`. Rejects upon sudden disconnection. |
| `async waitUntilDisconnect()` | Resolves when status <= `Disconnected`. |

---