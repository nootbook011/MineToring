# MineToring - API

This documentation provides a list of the existing API documentation for the MineToring framework classes.

## Contents
- [Protocol API](#protocol-api)
- [Bots](#bots)
- [World](#world)
- [Entity](#entity)
- [Storage](#storage)

---

## [Protocol API](./API/Versions/protocolAPI.md)

API that adapts based on the protocol version, specifically handling metadata within storage classes and certain version-specific plugins.

---

## Bots

### [BaseBedrockBot](./API/BaseBedrockBot.md)
The core of the MineToring framework, responsible for client initialization, session management, protocol versions, and the bot's lifecycle.

### [BedrockBot](./API/BedrockBot.md)
A high-level class for creating a fully functional bot in Minecraft Bedrock Edition.

### [BotOptionsManager](./API/BotOptionsManager.md)
The central configuration manager for the bot.

---

## World

### [BaseBedrockWorld](./API/BaseBedrockWorld.md)
The class is designed to manage the state of the game world.

### [BaseBedrockServer](./API/BedrockServer.md)
The class is designed to manage and store information about a Minecraft Bedrock server.

### [BaseBedrockDimension](./API/BaseBedrockDimension.md)
The class represents a container for data of a specific game dimension.

### [BaseBedrockChunk](./API/BaseBedrockChunk.md)
A class used for storing and processing chunk data.

### [BaseBedrockSubChunk](./API/BaseBedrockSubChunk.md)
A class for managing sub-chunk data layers.

### [BaseBedrockBlock](./API/BaseBedrockBlock.md)
A class for storing complete block data and facilitating interaction within the world.

---

## Entity

### [BedrockEntity](./API/BedrockEntity.md)
The base class for all entities and creatures within the game world.

### [BedrockPlayer](./API/BedrockPlayer.md)
A class representing a player on the server and within the world.

---

## Storage

### [BedrockPlugins](./API/BedrockPlugins.md)
The base class implementing the plugin and module system.

### [BedrockObjectStorage](./API/BedrockObjectStorage.md)
A base class for organizing and storing game object data.