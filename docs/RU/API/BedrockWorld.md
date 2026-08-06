# Class: BedrockWorld наследует [BedrockPlugins](./BedrockPlugins.md)

Класс предназначен для управления состоянием игрового мира. Он хранит глобальные данные мира (время, правила игры и т. д.), хранит всех сущностей в дистанции прорисовки бота и служит контейнером для различных измерений (Overworld, Nether, End).

## Содержание
- [Свойства](#свойства)
  - [version](#version)
  - [registry](#registry)
  - [time](#time)
  - [isCreated](#iscreated)
  - [entities](#entities)
  - [players](#players)
  - [settings](#settings)
  - [events](#events)
  - [experiments](#experiments)
- [Динамические Свойства](#динамические-свойства)
  - [gamerules](#gamerules)
- [События](#события)
  - [time(newTime, oldTime)](#timenewtime-oldtime)
  - [newEntity(entity)](#newentityentity)
  - [newPlayer(player)](#newplayerplayer)
  - [gamerules(newGamerules, oldGamerules)](#gamerulesnewgamerules-oldgamerules)
- [Методы](#методы)
  - [constructor(version, registry? = undefined)](#constructorversion-registry--undefined)
  - [async init()](#async-init)
  - [create(startGame? = undefined)](#createstartgame--undefined)
  - [getEntity(id)](#getentityid)
  - [getPlayer(username)](#getplayerusername)
  - [addEntity(entityPacket, typeEntity? = 0, playerList? = undefined)](#addentityentitypacket-typeentity--0-playerlist--undefined)
  - [setSettings(settingsInput)](#setsettingssettingsinput)
  - [getDimension(dimensionId)](#getdimensiondimensionid)
---

## Свойства

### `version`
**Тип**: `string`

Строка версии Minecraft Bedrock, для которой инициализирован мир (например, `'1.21.50'`).

### `registry`
**Тип**: `BedrockRegistry`

Содержит класс, который хранит локальные игровые данные для текущей версии из библиотеки `minecraft-data`.

### `time`
**Тип**: `Number`

Возвращает время мира в игровых тиках.

* **set**: Если входные данные являются числом, то устанавливает их и вызывает событие `time`, в противном случае пропускает запись.

### `isCreated`
**Тип**: `boolean`

Возвращает `true`, если мир был успешно создан через метод `create()`. До вызова этого метода значение `false`.

### `entities`
**Тип**: `BedrockEntities`

Предоставляет доступ к контроллеру сущностей мира. Он может получать и добавлять сущности в мир.

### `players`
**Тип**: `Object<String: BedrockPlayer>`

Предоставляет доступ к объекту игроков в зоне видимости бота. Ключи это имена пользователей, а значения экземпляры классов игроков.

### `settings`
**Тип**: `Object`

Объект, хранящий настройки мира (например: название мира, сложность, сид и т. д.). Создается только после вызова метода `.create()`.

### `events`
**Тип**: `EventEmitter`

Предоставляет доступ к классу `EventEmitter` мира.

### `experiments`
**Тип**: `Object`

Предоставляет доступ к экспериментальным функциям мира.

## Динамические Свойства

### `gamerules`
**Тип**: `BedrockGamerules`

Предоставляет доступ к контроллеру правил мира. Он может получать и изменять конкретные правила по их названиям.

* **Добавляет**: `BedrockGamerules`

---

## События

### `time(newTime, oldTime)`
Вызывается при изменении свойства `time` мира.

**Параметры**:
- `newTime` (`Number`): Актуальное время.
- `oldTime` (`Number`): Предыдущее время.

### `newEntity(entity)`
Вызывается при появлении новой сущности в радиусе прорисовки бота.

**Параметры**:
- `entity` ([`BedrockEntity`](./BedrockEntity.md)): Новая сущность.

### `newPlayer(player)`
Вызывается при появлении нового игрока в радиусе прорисовки бота.

**Параметры**:
- `player` ([`BedrockPlayer`](./BedrockPlayer.md)): Новый игрок.

### `gamerules(newGamerules, oldGamerules)`
Вызывается при изменении правил игры мира.

**Параметры**:
- `newGamerules` (`Object`): Новые правила.
- `oldGamerules` (`Object`): Старые правила.

---

## Методы

### `constructor(version, registry? = undefined)`
Создает экземпляр мира.

**Параметры**:
- `version` (`String`): Версия игры (например, `'1.21.50'`).
- `registry` (`BedrockRegistry`): Уже существующий реестр.

### `async init()`
Инициализирует заново зависимости класса. Рекомендуется вызывать только если вы создали класс самостоятельно.

### `create(startGame? = undefined)`
Инициализирует структуру мира. Перед вызовом обязательно нужно инициализировать зависимости методом `.init()` или передать их в конструкторе, иначе выбросит исключение.

**Параметры**:
- `startGame` (`Object|undefined`): Пакет `start_game` от сервера.

**Выбрасывает**: 
- `TypeError`: Если зависимости не были определены методом `.init()`.

### `getEntity(id)`
Возвращает сущность по идентификатору, если она находится в зоне видимости бота.

**Параметры**:
- `id` (`String|BigInt|UnsignedBigInt`): Идентификатор сущности.
    - **RuntimeId**
    - **UniqueId**

**Возвращает**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `getPlayer(username)`
Возвращает игрока по имени в игре, если он находится в зоне видимости бота.

**Параметры**:
- `username` (`String`): Игровое имя целевого игрока.

**Возвращает**: [`BedrockPlayer`](./BedrockPlayer.md)

### `addEntity(entityPacket, typeEntity? = 0, playerList? = undefined)`
Добавляет сущность в мир из сетевого пакета.

**Параметры**:
- `entityPacket` (`Object`): Сетевой пакет сущности.
- `typeEntity` (`Number`): Тип добавляемой сущности.
    - 0: Entity
    - 1: Player
    - 2: Item
- `playerList` (`BedrockPlayerList|undefined`): Список игроков, из которого парсер будет брать класс игрока при `typeEntity = 1`.

**Возвращает**: [`BedrockEntity`](./BedrockEntity.md)|[`BedrockPlayer`](./BedrockPlayer.md)

### `setSettings(settingsInput)`
Выполняет глубокое обновление настроек.

**Параметры**:
- `settingsInput` (`Object`): Объект с обновленными параметрами.

### `getDimension(dimensionId)`
Возвращает объект измерения по его ID. Если измерение еще не было создано/получено, класс инициализирует его автоматически.

**Параметры**:
- `dimensionId` (`Number`): ID измерения.
    - 0: Overworld.
    - 1: Nether.
    - 2: The End.

**Возвращает**: [`BedrockDimension`](./BedrockDimension.md)