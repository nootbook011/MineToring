# Class: BedrockWorld наследует [BedrockPlugins](./BedrockPlugins.md)

Класс предназначен для управления состоянием игрового мира. Он хранит глобальные метаданные сервера (время, правила игры и т.д.), обрабатывает пакет запуска игры и служит контейнером для различных измерений (Overworld, Nether, End).

## Содержание
- [Свойства](#свойства)
- [Методы](#методы)
- [Система измерений](#система-измерений)
- [Плагины-зависимости](#плагины-зависимости)
- [Примеры использования](#примеры-использования)

---

## Свойства

### `version`
**Тип**: `string`

Строка версии Minecraft Bedrock, для которой инициализирован мир (например, `'1.21.50'`). Используется для загрузки правильных парсеров данных.

### `isInited`
**Тип**: `boolean`

Возвращает `true`, если мир был успешно создан через метод `create()`. До вызова этого метода значение `false`.

### `metadata`
**Тип**: `object`

Геттер, возвращающий объект с текущими метаданными мира:
- Тип мира (Survival, Creative и т.д.)
- Настройки генерации (seed, уровень воды и т.д.)
- Сложность
- Правила игры

**Примечание**: Метаданные заполняются при создании мира через `create()`.

### `blobsManager`
**Тип**: `BedrockBlobsManager | undefined`

Экземпляр менеджера кэширования блоков. Инициализируется в методе `create()` если `BlobsManager` передан в плагинах.

---

## Методы

### `constructor(version, plugins = {})`
Создает экземпляр мира.

**Параметры**:
- `version` (`string`): Версия игры (например, `'1.21.50'`)
- `plugins` (`Object`): Объект с плагинами. **Обязательно** должен содержать инициализированный `ProtocolValidator`, так как конструктор не может инициализировать протокол асинхронно.

**Выбрасывает**: `TypeError` если `ProtocolValidator` не инициализирован или отсутствует

**Пример**:
```javascript
const world = new BedrockWorld('1.21.50', {
    ProtocolValidator: protocol,  // Обязательно
    ValidateAdapter: adapter,     // Опционально
    BlobsManager: blobsManager    // Опционально
})
```

### `create(startGame?)`
Инициализирует структуру мира.

**Параметры**:
- `startGame` (`Object | undefined`): Пакет `start_game` от сервера (опционально)

**Процесс**:
1. Получает парсер метаданных мира из базы данных протокола
2. Инициализирует `BlobsManager` если он подключен
3. Если передан `startGame`:
   - Передает пакет в адаптер (`ValidateAdapter.setStartgamePacket()`)
   - Парсит метаданные из пакета
4. Если пакет не передан:
   - Инициализирует метаданные со значениями по умолчанию
5. Устанавливает `isInited = true`

**Пример**:
```javascript
// С пакетом от сервера
world.create(startGamePacket)

// Без пакета (значения по умолчанию)
world.create()
```

### `setMetadata(metadataInput)`
Рекурсивно обновляет текущие метаданные мира новыми значениями.

**Параметры**:
- `metadataInput` (`Object`): Объект с новыми значениями метаданных

**Поведение**: Использует глубокое слияние (`recurseUpdate`), поэтому обновляются только переданные поля.

**Пример**:
```javascript
world.setMetadata({
    time: {
        day: 10,
        time: 6000
    }
})
```

### `getDimension(dimensionId)`
Возвращает объект измерения по его ID. Если измерение еще не было создано, класс инициализирует его автоматически.

**Параметры**:
- `dimensionId` (`number`): ID измерения

**Возвращает**: `BedrockDimension`

**Стандартные ID Minecraft**:
| ID | Название | Константа |
| :--- | :--- | :--- |
| `0` | Overworld (Обычный мир) | `-64 to +320 Y` |
| `1` | Nether (Нижний мир) | `0 to +128 Y` |
| `2` | The End (Край) | `0 to +256 Y` |

**Пример**:
```javascript
const overworld = world.getDimension(0)
const nether = world.getDimension(1)

console.log(`Overworld: ${overworld.length} чанков`)
console.log(`Nether: ${nether.length} чанков`)
```

---

## Система измерений

Каждое измерение — это отдельный контекст с собственным набором чанков и сущностей. Измерения изолированы друг от друга:

```javascript
const overworld = world.getDimension(0)
const nether = world.getDimension(1)

// Это разные объекты
console.log(overworld === nether) // false
console.log(overworld.length) // Количество чанков в Overworld
console.log(nether.length)    // Количество чанков в Nether
```

---

## Плагины-зависимости

Для корректной работы необходимо передать уже инициализированный класс `ProtocolValidator`:

* **ProtocolValidator** (Обязательно): Содержит парсеры и базу данных протокола для текущей версии
* **ValidateAdapter** (Опционально): Адаптер данных (обычно `PrismarineAdapter`), который преобразует пакеты Bedrock в удобный формат
* **BlobsManager** (Опционально): Менеджер кэширования чанков на диск для повышения производительности

---

## Примеры использования

### Инициализация мира
```javascript
import { ProtocolValidator } from 'minetoring'

// Инициализация протокола (async)
const protocol = new ProtocolValidator('1.21.50')
await protocol.init()

// Создание мира
const world = new BedrockWorld('1.21.50', {
    ProtocolValidator: protocol
})

// Инициализация мира
world.create()

console.log(`Мир инициализирован: ${world.isInited}`)
console.log(`Метаданные: ${JSON.stringify(world.metadata)}`)
```

### Работа с измерениями и метаданными
```javascript
// Получить все измерения
const overworld = world.getDimension(0)
const nether = world.getDimension(1)
const end = world.getDimension(2)

// Получить информацию
console.log(`Всего чанков в Overworld: ${overworld.length}`)
console.log(`Всего чанков в Nether: ${nether.length}`)

// Обновить метаданные
world.setMetadata({
    difficulty: 'hard',
    time: {
        day: 5,
        time: 12000
    }
})
```

### С адаптером и кэшированием
```javascript
import { PrismarineAdapter } from 'minetoring'

const protocol = new ProtocolValidator('1.21.50')
await protocol.init()

const world = new BedrockWorld('1.21.50', {
    ProtocolValidator: protocol,
    ValidateAdapter: new PrismarineAdapter('1.21.50'),
    BlobsManager: BedrockBlobsManager  // Кэширование чанков
})

world.create(startGamePacket)
```