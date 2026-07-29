# Class: BedrockEntity наследует [BedrockPlugins](./BedrockPlugins.md)

Базовый класс для всех существ в мире.

## Содержание
- [Свойства](#свойства)
  - [isCreated](#iscreated)
  - [metadata](#metadata)
  - [type](#type)
  - [uniqueId](#uniqueid)
  - [runtimeId](#runtimeid)
  - [position](#position)
  - [rotation](#rotation)
  - [pitch](#pitch)
  - [yaw](#yaw)
  - [roll](#roll)
  - [headYaw](#headyaw)
  - [events](#events)
  - [states](#states)
- [Динамические Свойства](#динамические-свойства)
  - [attributes](#attributes)
  - [health](#health)
  - [food](#food)
  - [xp](#xp)
- [События](#события)
  - [positionChange(newPos, oldPos)](#positionchangenewpos-oldpos)
  - [rotationChange(newRot, oldRot)](#rotationchangenewrot-oldrot)
  - [attributes(new, old)](#attributesnew-old)
  - [states(new)](#statesnew)
  - [move(position, rotation)](#moveposition-rotation)
  - [despawn](#despawn)
  - [death](#death)
- [Методы](#методы)
  - [create(type, uniqueId, runtimeId?)](#createtype-uniqueid-runtimeid--undefined)
  - [buildFromPacket(entityPacket)](#buildfrompacketentitypacket)
  - [updatePhysics(position?, yaw?, head_yaw?, pitch?)](#updatephysicsposition-yaw-head_yaw-pitch)
  - [setStates(statesInput)](#setstatesstatesinput)
  - [updateStatesFromPacket(packet)](#updatestatesfrompacketpacket)
- [Плагины-зависимости](#плагины-зависимости)

---

## Свойства

### `isCreated`
**Тип**: `boolean`

Возвращает `true`, если сущность была успешно создан через метод `create()`. До вызова этого метода значение `false`.

### `metadata`
**Тип**: `MinecraftData.Entity`

Статические метаданные сущности из базы `minecraft-data`, соответствующие её типу.

### `type`
**Тип**: `string`

Тип сущности без префикса `minecraft:` (например, `"skeleton"`).

### `uniqueId`
**Тип**: `bigint`

Уникальный постоянный ID сущности.

### `runtimeId`
**Тип**: `bigint`

Временный сетевой ID сущности в рамках текущей игровой сессии.

### `position`
**Тип**: `V3{ x, y, z }`

Позиция сущности в мире.

* **set**: Если передаваемое значение является валидным объектом `V3`, обновляет координаты и вызывает событие `positionChange`.

### `rotation`
**Тип**: `V3{ x, y, z }`

Поворот сущности в пространстве (`x` = pitch, `y` = yaw, `z` = roll).

* **set**: Если передаваемое значение является валидным объектом `V3`, обновляет углы поворота и вызывает событие `rotationChange`.

### `pitch`
**Тип**: `number`

Угол наклона головы/тела (соответствует `rotation.x`).

### `yaw`
**Тип**: `number`

Угол поворота тела (соответствует `rotation.y`).

### `roll`
**Тип**: `number`

Угол крена (соответствует `rotation.z`).

### `headYaw`
**Тип**: `number`

Угол поворота головы сущности.

### `events`
**Тип**: `EventEmitter`

Предоставляет доступ к классу `EventEmitter` сущности.

### `states`
**Тип**: `Object`

Текущие состояния и динамические переменные сущности.

---

## Динамические Свойства

### `attributes`
**Тип**: `BedrockAttributes`

Предоставляет доступ к контроллеру атрибутов сущности. Позволяет получать и изменять конкретные характеристики по их названиям.

* **Добавляет**: плагин `BedrockAttributes`

### `health`
**Тип**: `number|undefined`

Быстрый доступ к уровню здоровья сущности.

* **Добавляет**: плагин `BedrockAttributes`

### `food`
**Тип**: `number|undefined`

Быстрый доступ к уровню сытости сущности.

* **Добавляет**: плагин `BedrockAttributes`

### `xp`
**Тип**: `number|undefined`

Быстрый доступ к уровню опыта сущности.

* **Добавляет**: плагин `BedrockAttributes`

---

## События

### `positionChange(newPos, oldPos)`
Вызывается при изменении позиции сущности.

**Параметры**:
- `newPos` (`V3`): Новая позиция.
- `oldPos` (`V3`): Предыдущая позиция.

### `rotationChange(newRot, oldRot)`
Вызывается при изменении вектора поворота сущности.

**Параметры**:
- `newRot` (`V3`): Новый вектор поворота.
- `oldRot` (`V3`): Предыдущий вектор поворота.

### `attributes(new, old)`
Вызывается при обновлении атрибутов сущности.

**Параметры**:
- `new` (`Object`): Актуальные атрибуты.
- `old` (`Object|undefined`): Предыдущие атрибуты.

### `states(new)`
Вызывается при обновлении состояний сущности.

**Параметры**:
- `new` (`Object`): Актуальные состояния.

### `move(position, rotation)`
Вызывается при комплексном обновлении позиции и поворота сущности.

**Параметры**:
- `position` (`V3`): Новая позиция сущности.
- `rotation` (`Object`): Новый поворот сущности.

### `despawn`
Вызывается при деспавне сущности (исчезновении из зоны видимости бота). Это событие означает либо смерть сущности, либо её выход из дистанции прорисовки. В любом случае экземпляр класса считается устаревшим и перестаёт обновляться.

* **Смерть**: Сущность больше не появится. Для точного определения рекомендуется использовать событие `death`.
* **Выход из зоны видимости**: При повторном появлении сущности будет создан новый класс-контейнер.

### `death`
Вызывается после игровой смерти сущности в мире. После вызова этого события экземпляр класса считается устаревшим и перестаёт обновляться.

---

## Методы

### `create(type, uniqueId, runtimeId = undefined)`
Инициализирует сущность базовыми данными. Перед вызовом обязательно нужно инициализировать зависимости методом `.init()` или передать их в конструкторе, иначе выбросит исключение.

**Параметры**:
- `type` (`string`): Идентификатор типа сущности (префикс `minecraft:` удаляется автоматически).
- `uniqueId` (`bigint`): Уникальный ID сущности.
- `runtimeId` (`bigint|undefined`): Временный сетевой ID.

**Выбрасывает**: 
- `TypeError`: Если зависимости не были инициализированы асинхронным методом `.init()`.

### `buildFromPacket(entityPacket)`
Заполняет и инициализирует сущность данными из сетевого пакета `add_entity`.

**Параметры**:
- `entityPacket` (`Object`): Пакет спавна сущности от сервера.

**Возвращает**: `BedrockEntity` — Текущий обновлённый экземпляр класса.

### `updatePhysics(position?, yaw?, head_yaw?, pitch?)`
Обновляет физические параметры и координаты сущности.

**Параметры**:
- `position` (`V3|undefined`): Новая позиция.
- `yaw` (`number|undefined`): Поворот тела.
- `head_yaw` (`number|undefined`): Поворот головы.
- `pitch` (`number|undefined`): Наклон головы/тела.

### `setStates(statesInput)`
Выполняет глубокое обновление объекта состояний сущности.

**Параметры**:
- `statesInput` (`Object`): Объект с новыми состояниями.

### `updateStatesFromPacket(packet)`
Извлекает метаданные из пакета и обновляет состояния сущности (`states`).

**Параметры**:
- `packet` (`Object`): Сетевой пакет, содержащий массив `metadata`.

---

## Плагины-зависимости
В класс автоматически загружаются базовые плагины для корректной работы:
* **BedrockAttributes**: Менеджер характеристик сущности (здоровье, голод, опыт и т. д.).