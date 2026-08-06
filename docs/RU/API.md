# MineToring - API

Документация представляет собой список существующей API документации по классам фреймворка MineToring.

## Содержание
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
  - [BedrockObjectStorage](#bedrockobjectstorage)
---

## Bots

### [BaseBedrockBot](./API/BaseBedrockBot.md)
Ядро фреймворка MineToring, отвечающее за инициализацию клиента, управление сессиями, версиями протокола и жизненным циклом бота.

### [BedrockBot](./API/BedrockBot.md)
Высокоуровневый класс для создания полнофункционального бота в Minecraft Bedrock Edition.

### [BotOptionsManager](./API/BotOptionsManager.md)
Центральный менеджер конфигураций бота.

---

## World

### [BaseBedrockWorld](./API/BedrockWorld.md)
Класс для управления состоянием игрового мира.

### [BaseBedrockServer](./API/BedrockServer.md)
Класс предназначен для управления и хранения информации о сервере Minecraft Bedrock.

### [BaseBedrockDimension](./API/BedrockDimension.md)
Класс контейнер для данных конкретного игрового измерения.

### [BaseBedrockChunk](./API/BedrockChunk.md)
Класс предназначеный для хранения и обработки данных чанка.

### [BaseBedrockSubChunk](./API/BedrockSubChunk.md)
Класс для управления данными подчанка.

### [BaseBedrockBlock](./API/BedrockBlock.md)
Класс для хранения полных данных блока и взаимодействия с ним в мире.

---

## Entity

### [BedrockEntity](./API/BedrockEntity.md)
Базовый класс для всех существ в мире.

### [BedrockPlayer](./API/BedrockPlayer.md)
Класс, представляющий игрока в мире и сервере.

---

## Storage

### [BedrockPlugins](./API/BedrockPlugins.md)
Базовый класс, реализующий систему плагинов и модулей.

### [BedrockDependencies](./API/BedrockDependencies.md)
Базовый класс для инициализации зависимостей.