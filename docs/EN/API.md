# MineToring - API

This documentation provides an index of existing API documentation for the classes in the MineToring framework.

## Contents
- [Bots](#bots)
  - [BaseBedrockBot](#basebedrockbot)
  - [BedrockBot](#bedrockbot)
  - [BotOptionsManager](#botoptionsmanager)
- [World](#world)
  - [BaseBedrockWorld](#basebedrockworld)
  - [BaseBedrockServer](#basebedrockserver)
  - [BaseBedrockDimension](#basebedrockdimension)
  - [BaseBedrockChunk](#basebedrockchunk)
  - [BaseBedrockSubChunk](#basebedrocksubchunk)
  - [BaseBedrockBlock](#basebedrockblock)
- [Entity](#entity)
  - [BedrockEntity](#bedrockentity)
  - [BedrockPlayer](#bedrockplayer)
- [Storage](#storage)
  - [BedrockPlugins](#bedrockplugins)
  - [BedrockDependencies](#bedrockdependencies)
---

## Bots

### [BaseBedrockBot](./API/BaseBedrockBot.md)
The core of the MineToring framework, responsible for client initialization, session management, protocol version control, and bot lifecycle.

### [BedrockBot](./API/BedrockBot.md)
A high-level class for creating a feature-complete bot in Minecraft Bedrock Edition.

### [BotOptionsManager](./API/BotOptionsManager.md)
Central bot configuration manager.

---

## World

### [BaseBedrockWorld](./API/BedrockWorld.md)
Class for managing the state of the game world.

### [BaseBedrockServer](./API/BedrockServer.md)
Class designed for managing and storing information about a Minecraft Bedrock server.

### [BaseBedrockDimension](./API/BedrockDimension.md)
A data container class for a specific game dimension.

### [BaseBedrockChunk](./API/BedrockChunk.md)
Class designed for storing and processing chunk data.

### [BaseBedrockSubChunk](./API/BedrockSubChunk.md)
Class for managing sub-chunk data.

### [BaseBedrockBlock](./API/BedrockBlock.md)
Class for storing complete block data and interacting with blocks in the world.

---

## Entity

### [BedrockEntity](./API/BedrockEntity.md)
Base class for all entities in the world.

### [BedrockPlayer](./API/BedrockPlayer.md)
Class representing a player in the world and on the server.

---

## Storage

### [BedrockPlugins](./API/BedrockPlugins.md)
Base class implementing a plugin and module system.

### [BedrockDependencies](./API/BedrockDependencies.md)
Base class for dependency initialization.