# Class: BedrockPlayer наследует [BedrockEntity](./BedrockEntity.md)

Класс, представляющий игрока в мире и на сервере.

## Содержание
- [Свойства](#свойства)
  - [username](#username)
  - [uuid](#uuid)
  - [dimension](#dimension)
  - [permission](#permission)
  - [gamemode](#gamemode)
  - [abilities](#abilities)
  - [device](#device)
- [Динамические Свойства](#динамические-свойства)
  - [structure](#structure)
  - [platformChatId](#platformchatid)
  - [xuid](#xuid)
  - [role](#role)
  - [skin](#skin)
- [События](#события)
  - [changeDimension(newDimension, oldDimension)](#changedimensionnewdimension-olddimension)
  - [changePermission(newPermission, oldPermission)](#changepermissionnewpermission-oldpermission)
  - [changeGamemode(newGamemode, oldGamemode)](#changegamemodenewgamemode-oldgamemode)
- [Методы](#методы)
  - [create(username, uniqueId, uuid = undefined, runtimeId = undefined)](#createusername-uniqueid-uuid--undefined-runtimeid--undefined)
  - [buildFromPacket(playerPacket)](#buildfrompacketplayerpacket)
  - [setAbilities(abilitiesInput)](#setabilitiesabilitiesinput)
  - [updateAbilitiesFromPacket(playerPacket)](#updateabilitiesfrompacketplayerpacket)
---

## Свойства

### `username`
**Тип**: `string`

Игровой никнейм игрока.

### `uuid`
**Тип**: `string`

Уникальный UUID игрока.

### `dimension`
**Тип**: `number`

Идентификатор измерения (`dimensionId`), в котором находится игрок.

* **set**: Принимает числовой ID или строковое название измерения (преобразует через словарь `DIMENSIONS`). Вызывает событие `changeDimension`.
* **Выбрасывает**: `TypeError`, если передан неверный тип данных.

### `permission`
**Тип**: `number`

Уровень привилегий/прав игрока на сервере.

* **set**: Принимает числовой ID или строковое название уровня прав (преобразует через словарь `PERMISSION_LEVELS`). Вызывает событие `changePermission`.
* **Выбрасывает**: `TypeError`, если передан неверный тип данных.

### `gamemode`
**Тип**: `number`

Игровой режим игрока (`gamemodeId`).

* **set**: Принимает числовой ID или строковое название режима игры (преобразует через словарь `GAMEMODES`). Вызывает событие `changeGamemode`.
* **Выбрасывает**: `TypeError`, если передан неверный тип данных.

### `abilities`
**Тип**: `Object`

Объект со способностями и возможностями игрока (полет, иммунитет к урону и т. д.).

### `device`
**Тип**: `{ id: string, os: string }`

Данные об устройстве игрока (ID устройства и операционная система). Заполняется при вызове `buildFromPacket`.

---

## Динамические Свойства

### `structure`
**Тип**: `string|undefined`

Название структуры в которой сейчас находится игрок. (Это свойство есть только у класса бота игрока.)

### `platformChatId`
**Тип**: `string`

Уникальный platformChatId игрока.

* **Добавляет**: плагин `packetHandler`

### `xuid`
**Тип**: `string`

Уникальный Xbox User Id игрока.

* **Добавляет**: плагин `packetHandler`

### `role`
**Тип**: `{ host: boolean, subclient: boolean, teacher: boolean }`

Роль игрока на сервере.

* **Добавляет**: плагин `packetHandler`

### `skin`
**Тип**: `BedrockSkin`

Предоставляет доступ к хранилищу данных о скине игрока.

* **Добавляет**: плагин `BedrockSkin`

---

## События

### `changeDimension(newDimension, oldDimension)`
Вызывается при изменении измерения игрока.

**Параметры**:
- `newDimension` (`number`): Новое измерение.
- `oldDimension` (`number`): Предыдущее измерение.

### `changePermission(newPermission, oldPermission)`
Вызывается при изменении уровня прав игрока.

**Параметры**:
- `newPermission` (`number`): Новый уровень прав.
- `oldPermission` (`number`): Предыдущий уровень прав.

### `changeGamemode(newGamemode, oldGamemode)`
Вызывается при изменении режима игры игрока.

**Параметры**:
- `newGamemode` (`number`): Новый режим игры.
- `oldGamemode` (`number`): Предыдущий режим игры.

---

## Методы

### `create(username, uniqueId, uuid = undefined, runtimeId = undefined)`
Инициализирует игрока базовыми данными. Перед вызовом обязательно нужно инициализировать зависимости методом `.init()` или передать их в конструкторе, иначе выбросит исключение.

**Параметры**:
- `username` (`string`): Никнейм игрока.
- `uniqueId` (`bigint`): Уникальный ID сущности.
- `uuid` (`string|undefined`): UUID игрока.
- `runtimeId` (`bigint|undefined`): Сетевой временный ID.

### `buildFromPacket(playerPacket)`
Заполняет класс данными из сетевого пакета игрока (`player_list` / `add_player`).

**Параметры**:
- `playerPacket` (`Object`): Пакет с данными игрока.

**Возвращает**: `BedrockPlayer` — Текущий обновлённый экземпляр класса.

### `setAbilities(abilitiesInput)`
Выполняет глубокое обновление объекта способностей игрока (`abilities`).

**Параметры**:
- `abilitiesInput` (`Object`): Объект с обновлёнными параметрами способностей.

### `updateAbilitiesFromPacket(playerPacket)`
Извлекает активные способности из сетевого пакета игрока и обновляет их методом `setAbilities`.

**Параметры**:
- `playerPacket` (`Object`): Пакет, содержащий массив `abilities`.