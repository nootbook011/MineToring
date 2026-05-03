# Class: BedrockBot inherits [BaseBedrockBot](./BaseBedrockBot.md)

A high-level class for creating a fully functional bot in Minecraft Bedrock Edition. It combines network protocol management, automatic storage and synchronization of world, server, and player data, and a built-in action module for executing commands.

## Contents
- [Properties](#properties)

---

## Properties

### `world`
**Type**: [`BedrockWorld`](./BaseBedrockWorld.md)

An instance of the `BedrockWorld` class containing information about the current world: loaded chunks, blocks, and entities within the bot's view distance. It is initialized in the `init()` method after calling the parent class.

### `server`
**Type**: [`BedrockServer`](./BedrockServer.md)

An instance of the `BedrockServer` class containing information about the current server: a list of all players and technical information about the current server. It is initialized simultaneously with `world`.

### `workDir`
**Type**: `Path | undefined`

The path to the bot's working directory. Used for saving logs (if `logToFile` is enabled) and caching world data. Initialized from `config.botDir`.

## Dynamic Properties

### `player`
**Type**: [`BedrockPlayer`](./BedrockPlayer.md)

Contains the bot's player class on the server. Provides access to full information about the player and their state.

* **Adds**: `ClientPacketSession` plugin

### `actions`
**Type**: [`ActionsBotModule`](./Versions/protocolAPI.md)

Provides access to the high-level bot action controller. It can perform batch actions and listen for high-level events.

* **Adds**: `ActionsBotModule` plugin