# Class: BedrockBot inherits [BaseBedrockBot](./BaseBedrockBot.md)

A high-level class for creating a fully-featured bot in Minecraft Bedrock Edition. It combines network protocol management, automatic storage and synchronization of world, server, and player data, as well as a built-in action module for executing commands.

## Contents
- [Properties](#properties)
  - [world](#world)
  - [server](#server)
  - [registry](#registry)
  - [workDir](#workdir)
- [Dynamic Properties](#dynamic-properties)
  - [player](#player)
  - [actions](#actions)
---

## Properties

### `world`
**Type**: [`BedrockWorld`](./BaseBedrockWorld.md)

An instance of the `BedrockWorld` class containing information about the current world: loaded chunks, blocks, and entities within the bot's render distance. Initialized in the `init()` method after calling the parent class.

### `server`
**Type**: [`BedrockServer`](./BedrockServer.md)

An instance of the `BedrockServer` class containing information about the current server: the player list and technical server information. Initialized simultaneously with `world`.

### `registry`
**Type**: `BedrockRegistry`

Contains a class that stores local game data for the current version from the `minecraft-data` library.

### `workDir`
**Type**: `Path | undefined`

The path to the bot's working directory. Used for saving logs (if `logToFile` is enabled) and caching world data. Initialized from `config.botDir`.

## Dynamic Properties

### `player`
**Type**: [`BedrockPlayer`](./BedrockPlayer.md)

Contains the bot's player class on the server. Provides full access to information about the player and its state.

* **Adds**: `ClientPacketSession` plugin

### `actions`
**Type**: `ActionsBotModule`

Provides access to the high-level bot action controller. Can execute batched actions and listen for high-level events.

* **Adds**: `ActionsBotModule` plugin