# MineToring

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM version](https://img.shields.io/npm/v/minetoring.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/minetoring)
[![Framework](https://img.shields.io/badge/Base-PrismarineJS--Bedrock--Protocol-green)](https://github.com/PrismarineJS/bedrock-protocol)

| <sub>RU</sub> [русский](./docs/RU/README.md)
|-------------------------|

Advanced framework wrapper built on top of the **Bedrock-Protocol** library. It provides high-level tools for creating bots and monitoring utilities, automating world data and session management.

## Key Features

**MineToring** is the first project that provides a **high-level API** for working with bots on **Minecraft Bedrock Edition**

---

* **Data Containers**: Ready-to-use classes for storing and modifying game data (worlds, servers, players).
* **Protocol Automation**: Built-in automatic packet management and connection handling.
* **Client Emulation**: Focus on precise reproduction of real game client behavior at the packet level.
* **Modularity**: Ability to replace standard classes with custom ones or inherit from base classes to extend logic.

---

* **Supported Minecraft Bedrock versions:** `1.21.0, 1.21.2, 1.21.21, 1.21.30, 1.21.42, 1.21.50, 1.21.60, 1.21.70, 1.21.80, 1.21.90, 1.21.93, 1.21.100`.
* **Tested on:** `1.21.0, 1.21.50, 1.21.100`.

---

## Roadmap
See [RoadMap](./docs/EN/RoadMap.md) to see our current goals for the project

---
## installation

Install the current Node version to use it, Next, run:
> `npm install minetoring`

## Getting Started

More examples and tests can be found in [tests](./tests/)

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
## Docs
Docs in different languages can be found in [docs directory](./docs/)

- [Plugins](./docs/EN/Plugins.md)
- [Sessions](./docs/EN/ClientSessions.md)

---

## Contact
Author: @nootbook011

## License
Project licensed under MIT (see [LICENSE](./LICENSE))