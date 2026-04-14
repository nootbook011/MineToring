# MineToring

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework](https://img.shields.io/badge/Base-PrismarineJS--Bedrock--Protocol-green)](https://github.com/PrismarineJS/bedrock-protocol)

**MineToring** это продвинутый фреймворк-надстройка, построенный поверх библиотеки **Bedrock-Protocol**. Он предоставляет высокоуровневые инструменты для создания ботов и систем мониторинга, автоматизируя управление данными мира и сессиями.


## Ключевые особенности

**MineToring** - это первый проект, который предоставляет **высокоуровневый API** для работы с ботами в **Minecraft Bedrock Edition**

---

* **Контейнеры данных**: Готовые классы для хранения и модификации игровых данных (миры, серверы, игроки).
* **Автоматизация протокола**: Встроенное управление пакетами и процессами подключения «из коробки».
* **Эмуляция клиента**: Точное воспроизведение поведения реального игрового клиента на уровне сетевых пакетов.
* **Модульность**: Возможность замены стандартных классов на кастомные или расширение логики через наследование.

---

* **Поддерживаемые версии Minecraft Bedrock:** `1.21.0, 1.21.2, 1.21.21, 1.21.30, 1.21.42, 1.21.50, 1.21.60, 1.21.70, 1.21.80, 1.21.90, 1.21.93, 1.21.100`.
* **Протестировано на версиях:** `1.21.0, 1.21.50, 1.21.100`.

---

## План Разработки (Roadmap)
Смотрите [RoadMap](./RoadMap.md) чтобы узнать о наших текущих целях

---
## Установка
Установите текущую версию Node, затем запустите:
> `npm install minetoring`

## Начало работы

Больше примеров и тестов можно найти в папке [tests](../../tests/).

```javascript
import { Bot, BotOptions } from 'minetoring'

// Для помощи и упрощенной настройки в IDE
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
// Асинхронная инициализация для динамического импорта модулей протокола
await bot.init(opt)
await bot.connect()

// Необходимо для уверенности, что клиент загружен на момент отправки пакетов
await bot.waitUntilSpawn()

// await необязателен для действий, когда вам не нужно ждать обработки пакета сервером
await bot.actions.sendMessage('Hello World!')
bot.disconnect()
```
---
## Документация
Документация на других языках может быть найдена в [папке docs](..)

- [Plugins](./Plugins.md)
- [Sessions](./ClientSessions.md)

---

## Contact
Author: @nootbook011

## License
Project licensed under MIT (see [LICENSE](../../LICENSE))