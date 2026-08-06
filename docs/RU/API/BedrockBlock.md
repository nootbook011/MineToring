# Class: BedrockBlock наследует [BedrockPlugins](./BedrockPlugins.md)

Класс для хранения полных данных блока и взаимодействия с ним в мире. Используется как одноразовый класс и не обновляется динамически с блоком.

## Содержание
- [Свойства](#свойства)
  - [position](#position)
  - [id](#id)
  - [runtimeId](#runtimeid)
  - [metadata](#metadata)
  - [secondLayerBlock](#secondlayerblock)
  - [states](#states)
  - [entityNBT](#entitynbt)
- [Методы](#методы)
  - [create(runtimeId = undefined, id = undefined, secondLayerBlockId? = undefined)](#createruntimeid--undefined-id--undefined-secondlayerblockid--undefined)
---

## Свойства

### `position`
**Тип**: `V3{ x, y, z }`

Быстрый доступ к позиции блока в мире.

* **set**: Если передаваемое значение является валидным объектом `V3`, обновляет координаты, в противном случае возвращает `false`.

### `id`
**Тип**: `number`

Айди целевого блока внутри реестра игры.

### `runtimeId`
**Тип**: `number`

Сетевой айди блока внутри сессии сервера и клиента.

### `metadata`
**Тип**: `MinecraftData.Block`

Объект со статическими метаданными блока из базы `minecraft-data`.

### `secondLayerBlock`
**Тип**: `MinecraftData.Block`

Возвращает метаданные блока, заполняющего текущий блок (второй слой блока, например, вода или снег).

* **set**(`secondLayerBlockId`): Устанавливает новый игровой айди для второго слоя блока.

### `states`
**Тип**: `Object`

Объект с NBT состояниями текущего блок (например: поворот).

### `entityNBT`
**Тип**: `Object`

Объект с NBT данными сущности блока (Block Entity) в сыром виде.

* **set**: Устанавливает новый объект entityNBT для блока.

---

## Методы

### `create(runtimeId = undefined, id = undefined, secondLayerBlockId? = undefined)`
Инициализирует экземпляр блока метаданными и состояниями. Перед вызовом обязательно нужно инициализировать зависимости методом `.init()` или передать их в конструкторе, иначе выбросит исключение.

**Параметры**:
- `id` (`number|undefined`): Числовой ID блока.
- `runtimeId` (`number|undefined`): Сетевой `runtimeId` блока. Если передан, автоматически загружает и устанавливает состояния блока.
- `secondLayerBlockId` (`number|undefined`): Числовой ID игры для второго слоя блока.

> Если ни один параметр не передан, инициализирует блок как `air` (воздух).

**Выбрасывает**: 
- `TypeError`: Если зависимости не были инициализированы асинхронным методом `.init()`.