# Class: BedrockBlock наследует [BedrockPlugins](./BedrockPlugins.md)

Класс для хранения полных данных блока и взаимодействия с ним в мире.

## Содержание
- [Свойства](#свойства)
  - [position](#position)
  - [metadata](#metadata)
  - [fillBlock](#fillblock)
  - [states](#states)
  - [rawStates](#rawstates)
  - [entityNBT](#entitynbt)
  - [rawEntityNBT](#rawentitynbt)
- [Методы](#методы)
  - [create(id?, runtimeId?)](#createid-runtimeid)
  - [setStates(stateId)](#setstatesstateid)
  - [setFillBlock(blockId)](#setfillblockblockid)
  - [setEntityData(entityNBT)](#setentitydataentitynbt)

---

## Свойства

### `position`
**Тип**: `V3{ x, y, z }`

Быстрый доступ к позиции блока в мире.

* **set**: Если передаваемое значение является валидным объектом `V3`, обновляет координаты, в противном случае возвращает `false`.

### `metadata`
**Тип**: `MinecraftData.Block`

Объект со статическими метаданными блока из базы `minecraft-data`.

### `fillBlock`
**Тип**: `MinecraftData.Block`

Возвращает метаданные блока, заполняющего текущий блок (второй слой блока, например, вода или снег).

### `states`
**Тип**: `Object`

Упрощённый объект с динамическими состояниями блока (декодированный из NBT через `simplify`).

### `rawStates`
**Тип**: `Object`

Исходные незащищённые состояния блока в NBT-формате.

### `entityNBT`
**Тип**: `Object`

Упрощённые NBT-данные сущности блока (Block Entity), полученные от сервера.

### `rawEntityNBT`
**Тип**: `Object`

Исходные NBT-данные сущности блока (Block Entity) в сыром виде.

---

## Методы

### `create(id = undefined, runtimeId = undefined)`
Инициализирует экземпляр блока метаданными и состояниями. Перед вызовом обязательно нужно инициализировать зависимости методом `.init()` или передать их в конструкторе, иначе выбросит исключение.

**Параметры**:
- `id` (`number|undefined`): Числовой ID блока.
- `runtimeId` (`number|undefined`): Сетевой `runtimeId` блока. Если передан, автоматически загружает и устанавливает состояния блока.

> Если ни один параметр не передан, инициализирует блок как `air` (воздух).

**Выбрасывает**: 
- `TypeError`: Если зависимости не были инициализированы асинхронным методом `.init()`.

### `setStates(stateId)`
Устанавливает состояния блока по идентификатору состояния (`stateId`).

**Параметры**:
- `stateId` (`number`): ID состояния блока из реестра.

### `setFillBlock(blockId)`
Устанавливает блок для второго слоя (например, для заполнения водой).

**Параметры**:
- `blockId` (`number`): ID блока заполнения.

### `setEntityData(entityNBT)`
Устанавливает NBT-данные сущности блока (Block Entity).

**Параметры**:
- `entityNBT` (`Object`): Объект с NBT-данными.