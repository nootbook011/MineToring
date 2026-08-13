# Class: BedrockServer наследует [BedrockPlugins](./BedrockPlugins.md)

Класс предназначен для управления и хранения информации о сервере Minecraft Bedrock. Он хранит метаданые сервера и полный список игроков на нем.

## Содержание
- [Свойства](#свойства)
  - [version](#version)
  - [registry](#registry)
  - [events](#events)
  - [settings](#settings)
  - [playerList](#playerlist)
  - [isCreated](#iscreated)
- [Методы](#методы)
  - [constructor(version, offline = true, host = '127.0.0.1', port = 19132, registry = undefined)](#constructorversion-offline--true-host--127001-port--19132-registry--undefined)
  - [async init()](#async-init)
  - [create(startGame? = undefined)](#createstartgame--undefined)
  - [addPlayer(BedrockPlayer)](#addplayerbedrockplayer)
  - [getPlayer(id)](#getplayerid)
  - [setSettings(settingsInput)](#setsettingssettingsinput)
---

## Свойства

### `version`
**Тип**: `string`

Строка версии Minecraft Bedrock, для которой инициализирован сервер (например, `'1.21.50'`).

### `registry`
**Тип**: `BedrockRegistry`

Содержит класс, который хранит локальные игровые данные для текущей версии из библиотеки `minecraft-data`.

### `events`
**Тип**: `EventEmitter`

Предоставляет доступ к классу `EventEmitter` сервера.

### `settings`
**Тип**: `Object`

Объект, хранящий настройки сервера. Создается только после вызова метода `.create()`.

### `playerList`
**Тип**: `BedrockPlayerList`

Предоставляет доступ к хранилищу всех игроков на сервере.

### `isCreated`
**Тип**: `boolean`

Возвращает `true`, если мир был успешно создан через метод `create()`. До вызова этого метода значение `false`.

## Методы

### `constructor(version, offline = true, host = '127.0.0.1', port = 19132, registry = undefined)`
Создает экземпляр сервера.

**Параметры**:
- `version` (`String`): Версия игры (например, `'1.21.50'`).
- `offline` (`boolean`): Статус сервера.
- `host` (`String`): Хост сервера.
- `port` (`number`): Порт сервера.
- `registry` (`BedrockRegistry`): Регистр игры.

### `async init()`
Инициализирует заново зависимости класса. Рекомендуется вызывать только если вы создали класс самостоятельно.

### `create(startGame? = undefined)`
Инициализирует структуру сервера, перед вызовом обязательно нужно инициализировать протокол методом `.initProtocol`, иначе выбросит исключение.

**Параметры**:
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

### `setSettings(settingsInput)`
Выполняет глубокое обновление настроек.

**Параметры**:
- `settingsInput` (`Object`): Объект с обновленными параметрами.
