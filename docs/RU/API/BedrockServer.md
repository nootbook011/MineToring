# Class: BedrockServer наследует [BedrockPlugins](./BedrockPlugins.md)

Класс предназначен для управления и хранения информации о сервере Minecraft Bedrock. Он хранит метаданые сервера и полный список игроков на нем.

## Содержание
- [Свойства](#свойства)
  - [metadata](#metadata)
  - [playerList](#playerlist)
  - [isInited](#isinited)
- [Методы](#методы)
  - [constructor(version)](#constructorversion)
  - [async initProtocol(protocol? = undefined)](#async-initprotocolprotocol--undefined)
  - [create(serverData, startGame? = undefined)](#createserverdata-startgame--undefined)
  - [addPlayer(BedrockPlayer)](#addplayerbedrockplayer)
  - [getPlayer(id)](#getplayerid)
  - [setMetadata(metadataInput)](#setmetadatametadatainput)
---

## Свойства

### `metadata`
**Тип**: `Object`

Объект с динамическими метаданными сервера.
Содержимое зависит от версии протокола которую использует сервер, [смотрите ProtocolAPI.](./Versions/protocolAPI.md)


### `playerList`
**Тип**: `BedrockPlayerList`

Предоставляет доступ к хранилищу всех игроков на сервере.

### `isInited`
**Тип**: `boolean`

Возвращает `true`, если мир был успешно создан через метод `create()`. До вызова этого метода значение `false`.

## Методы

### `constructor(version)`
Создает экземпляр сервера.

**Параметры**:
- `version` (`String`): Версия игры (например, `'1.21.50'`)

### `async initProtocol(protocol? = undefined)`
Инициализирует данные протокола класса, не рекомендуется вызывать самостоятельно, если вы не знаете, что делаете.

**Параметры**:
- `protocol` (`BedrockProtocol|undefined`): Если установлен уже имеющийся протокол, то он будет инициализирован в классе, в противном случае асинхронно инициализирует протокол автоматически, опираясь на свойство `.version` класса.

### `create(serverData, startGame? = undefined)`
Инициализирует структуру сервера, перед вызовом обязательно нужно инициализировать протокол методом `.initProtocol`, иначе выбросит исключение.

**Параметры**:
- `serverData` (`Object`): Объект с базовыми данными сервера такие как хост, порт и состояние офлайн.
- `startGame` (`Object|undefined`): Пакет `start_game` от сервера

**Выбрасывает**: 
- `TypeError`: Если протокол не определён методом `.initProtocol`.

### `addPlayer(BedrockPlayer)`
Добавляет игрока на сервер по его классу.

**Парамаетры**:
- `BedrockPlayer` ([`BedrockPlayer`](./BedrockPlayer.md)): Класс игрока.

### `getPlayer(id)`
Возвращает игрока по его идентификатору.

**Параметры**:
- `id` (`Unsigned BigInt|String`): Идентификатор по которому можно найти игрока.
    - **username**
    - **uuid**
    - **uniqueId**

**Возвращает**: [`BedrockPlayer`](./BedrockPlayer.md)

### `setMetadata(metadataInput)`
Глубокое обновление метаданных.

**Параметры**:
- `metadataInput` (`Object`): Объект с обновленными знаниями.