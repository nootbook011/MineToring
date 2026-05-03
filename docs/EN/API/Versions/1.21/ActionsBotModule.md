# Class: ActionsModule inherits BaseModule

The `ActionsModule` class provides a high-level interface for the bot to interact with the Minecraft Bedrock game world. It performs high-level batch actions.

## Contents
- [Properties](#properties)
- [Methods](#methods)
- [Events](#events)

---

## Properties

### `events`
**Type**: `EventEmitter`

Provides access to the internal `EventEmitter` instance for managing module events.

---

## Methods

### `async sendMessage(messageText, autoCommandExecute = true)`
Sends a text message to the chat. If the text starts with `/` and the `autoCommandExecute` parameter is enabled, the method will automatically redirect the call to `sendCommand`.

**Parameters**:
- `messageText` (`string`): The message text.
- `autoCommandExecute` (`boolean`): If `true`, strings starting with `/` are processed as commands. Defaults to `true`.

### `async sendCommand(commandText, returnOutput = true)`
Sends a command to the server.

**Parameters**:
- `commandText` (`string`): The command text (may or may not include the `/` prefix).
- `returnOutput` (`boolean`): If `true`, the method will wait for a response from the server and return the execution result. Defaults to `true`.

**Returns**: `Promise<Object|undefined>` — The command output object (the `output` field from the packet) or `undefined`.

### `respawn()`
Initiates the player respawn process. The method sends the necessary packets to the server.

### `on(e, cb)` / `once(e, cb)` / `off(e, cb)`
Helper methods for managing module events (proxies calls to `this.events`).

**Parameters**:
- `e` (`string`): Event name.
- `cb` (`function`): Callback function.

---

## Events

### `text(textData)`
Triggered when the bot receives a message.

**Parameters**:
- `textData` (`Object`): Data object. The data structure is shown below.

**TextData**
```js
{
    type: String,
    from: {
        name: String|undefined,
        xuid: String|undefined,
        },
    text: String,
}