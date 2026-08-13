# MineToring

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM version](https://img.shields.io/npm/v/minetoring.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/minetoring)
[![Framework](https://img.shields.io/badge/Base-PrismarineJS--Bedrock--Protocol-green)](https://github.com/PrismarineJS/bedrock-protocol)

| <sub>RU</sub> [русский](./docs/RU/README.md)
|-------------------------|

**Advanced Framework** built on top of **Bedrock-Protocol** lib, provides high-level API for creating bots on Minecraft Bedrock.

## Key Features

**MineToring** is the first project that provides a **high-level API** for working with bots on **Minecraft Bedrock Edition**

---

- **Entity Support**: The bot sees all entities, players, and items within render distance and possesses all available information about them: from attributes and states to the device used by another player.
- **Block Support**: Implements the world data storage architecture of the original game. Provides full access to block data, including NBT, the second block layer, and 3D biomes. Features highly efficient built-in methods for block searching and iteration.
- **Client Emulation**: Network interaction and packet management fully replicate official client behavior. The server authentication process, including lossless world and data loading phases, is identical to connecting via an official game client.
- **High-Level Actions**: Ready-to-use bot actions allowing automatic respawning after death or sending chat commands.

---

* **Supported Minecraft Bedrock versions:** `1.21.0, 1.21.2, 1.21.21, 1.21.30, 1.21.42, 1.21.50, 1.21.60, 1.21.70, 1.21.80, 1.21.90, 1.21.93, 1.21.100`.
* **Tested on:** `1.21.0, 1.21.50, 1.21.100`.

---

## API Feature
Available high-level API interfaces for interacting with **Minecraft Bedrock** data and mechanics ([see API documentation](#api-documentation)).

### Custom Client
A modified client based on **Bedrock-Protocol** with numerous enhancements to ensure convenient, high-level interaction.

- **Options Manager**: A convenient class for managing client configuration, providing IDE autocompletion.
- **Base Client**: Provides fundamental network interaction with remote servers via the Bedrock protocol. Features session data generation and saving for re-authentication. Allows multiple server reconnects without losing session state. Provides low-level network control methods (sending/awaiting packets), high-level methods to await bot connection states, and more.
- **High-Level Bot**: Built on top of the client, it automatically manages network traffic through high-level API methods while emulating the official game client. Provides access to the rest of the framework API based on target server data.

### Data Processing
Custom, highly efficient architecture for handling game data.

- **Server**: Technical server information and a full list of connected players.
- **World**: World time, dimensions, game rules (gamerules), experiments, and general world information.
- **Entities**: Data for entities, players, and items. Methods for retrieving entity states, player device and skin info, and dropped item details.
- **Dimensions**: Methods for retrieving and searching blocks and biomes within a dimension using the local chunk map.
- **Chunks**: Storage and processing for biome and sub-chunk data.
    - **Sub-chunks**: Palette and block information within sub-chunks.
    - **Blocks**: Complete information on specific blocks in the world.
    - **Biomes**: 2D/3D biome map within chunk boundaries.

---

## API Documentation
Docs in different languages can be found in [docs directory](./docs/)

- [API](./docs/EN/API.md)
- [Plugins](./docs/EN/Plugins.md)
- [Sessions](./docs/EN/ClientSessions.md)

## Roadmap
See [RoadMap](./docs/EN/RoadMap.md) to see our current goals for the project

---

## Installation
Install the current version of Node.js, then run the following in your terminal:
```bash
npm install minetoring
```

To update MineToring and its dependencies, run:
```bash
npm update
```

## Getting Started

More examples can be found in [examples](./examples/)

```javascript
import { Bot, BotOptions } from 'minetoring'

// For help and easy setup in IDE
const opt = new BotOptions()
opt.configServer({
    version: '1.21.50',
    host: '127.0.0.1',
    port: 19132
})
opt.configClient({
    username: 'Steve',
})

const bot = new Bot()
// Asynchronous initialization for dynamic imports modules in protocol
await bot.init(opt)
await bot.connect()

// Necessary to ensure that client is loaded at the time of sending packets
await bot.waitUntilSpawn()

// await is optional for actions when you don't have to wait for packet to be processed by server
await bot.actions.sendMessage('Hello World!')
bot.disconnect()
```
---

## Contact
Author: @nootbook011

## License
Project licensed under MIT (see [LICENSE](./LICENSE))