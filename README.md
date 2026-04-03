# MineToring

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework](https://img.shields.io/badge/Base-PrismarineJS--Bedrock--Protocol-green)](https://github.com/PrismarineJS/bedrock-protocol)

**MineToring** is an advanced framework wrapper built on top of the **Bedrock-Protocol** library. It provides high-level tools for creating bots and monitoring utilities, automating world data and session management.


---

* **Supported Minecraft Bedrock versions:** `1.18.0, 1.18.11, 1.18.30, 1.19.1, 1.19.10, 1.19.20, 1.19.21, 1.19.30, 1.19.40, 1.19.41, 1.19.50, 1.19.60, 1.19.62, 1.19.63, 1.19.70, 1.19.80, 1.20.0, 1.20.10, 1.20.30, 1.20.40, 1.20.50, 1.20.61, 1.20.71, 1.20.80, 1.21.0, 1.21.2, 1.21.21, 1.21.30, 1.21.42, 1.21.50, 1.21.60, 1.21.70, 1.21.80, 1.21.90, 1.21.93, 1.21.100`
* **Tested on:** `1.21.50`

---

**This readme is available in other languages!**
- [**Russian**](./docs/RU/README.md)

---

## Key Features

* **Data Containers**: Ready-to-use classes for storing and modifying game data (worlds, servers, players).
* **Protocol Automation**: Built-in automatic packet management and connection handling.
* **Client Emulation**: Focus on precise reproduction of real game client behavior at the packet level.
* **Modularity**: Ability to replace standard classes with custom ones or inherit from base classes to extend logic.

---

### Custom Client Class

* **Session Control**: Allows saving and loading sessions on the target server so the bot can log in using them.
* **Reusable Client**: Enables disconnecting and reconnecting to the server using the same bot class without losing the session; the server will recognize you even after reconnecting!
* **Flexible Login-packet Modification**: You can easily modify data within the client's login packet, allowing you to choose the bot's skin, change device data, and much more!
---

### 🛠 Current Changes (v0.6)


---
## installation
`npm install minetoring`

## 🚀 Getting Started

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

## 🏗 Project Architecture

The project is divided into logical blocks to simplify development:
* **Core-[BaseClasses](./src/BaseClasses/)**: The core containing source code for base abstract classes of data stores and the client; a stable foundation.
* **Main-[MainClasses](./src/MainClasses/)**: Main modules for operations and automation, containing dynamic protocol version imports, the main bot class, and ready-made data handling classes.

---

## Contact
Author: @nootbook011

## License
Project licensed under MIT (see [LICENSE](./LICENSE))