# MineToring - API

Документация представляет собой список существующей API документации по классам фреймворка MineToring.

## Содержание
- [Protocol API](#protocol-api)
- [Bots](#bots)
- [World](#world)
- [Entity](#entity)
- [Storage](#storage)

---

## [Protocol API](./API/Versions/protocolAPI.md)

API которое изменяется в зависимости от версии протокола такие как метаданные внутри классов хранилищ и некоторые плагины.

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

### [BaseBedrockWorld](./API/BaseBedrockWorld.md)
Класс для управления состоянием игрового мира.

### [BaseBedrockServer](./API/BedrockServer.md)
Класс предназначен для управления и хранения информации о сервере Minecraft Bedrock.

### [BaseBedrockDimension](./API/BaseBedrockDimension.md)
Класс контейнер для данных конкретного игрового измерения.

### [BaseBedrockChunk](./API/BaseBedrockChunk.md)
Класс предназначеный для хранения и обработки данных чанка.

### [BaseBedrockSubChunk](./API/BaseBedrockSubChunk.md)
Класс для управления данными подчанка.

### [BaseBedrockBlock](./API/BaseBedrockBlock.md)
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

### [BedrockObjectStorage](./API/BedrockObjectStorage.md)
Базовый класс для организации хранения данных игровых объектов.