# MineToring - API

This documentation provides an index of existing API documentation for the classes in the MineToring framework.

## Contents
- [Bots](#bots)
  - [BaseBedrockBot](#basebedrockbot)
  - [BedrockBot](#bedrockbot)
  - [BotOptionsManager](#botoptionsmanager)
- [World](#world)
  - [BedrockWorld](#basebedrockworld)
  - [BedrockServer](#basebedrockserver)
  - [BedrockDimension](#basebedrockdimension)
  - [BedrockChunk](#basebedrockchunk)
  - [BedrockSubChunk](#basebedrocksubchunk)
  - [BedrockBlock](#basebedrockblock)
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

### [BedrockWorld](./API/BedrockWorld.md)
Class for managing the state of the game world.

### [BedrockServer](./API/BedrockServer.md)
Class designed for managing and storing information about a Minecraft Bedrock server.

### [BedrockDimension](./API/BedrockDimension.md)
A data container class for a specific game dimension.

### [BedrockChunk](./API/BedrockChunk.md)
Class designed for storing and processing chunk data.

### [BedrockSubChunk](./API/BedrockSubChunk.md)
Class for managing sub-chunk data.

### [BedrockBlock](./API/BedrockBlock.md)
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