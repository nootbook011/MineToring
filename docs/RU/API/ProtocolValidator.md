# Class: ProtocolValidator

Валидатор и динамический загрузчик протокола для различных версий Minecraft Bedrock. Класс отвечает за асинхронную загрузку версионных модулей протокола, включая парсеры пакетов, контроллеры и модули действий.

## Содержание
- [Свойства](#свойства)
- [Методы](#методы)
- [Структура загружаемых модулей](#структура-загружаемых-модулей)
- [Система fallback версий](#система-fallback-версий)
- [Примеры использования](#примеры-использования)

---

## Свойства

### `version`
**Тип**: `string`

Строка версии Minecraft Bedrock (например, `'1.21.50'`), для которой был инициализирован валидатор.

### `Protocol`
**Тип**: `Object` (структура зависит от версии)

Объект, содержащий все загруженные модули протокола для данной версии. Инициализируется асинхронно в методе `init()`.

**Содержит**:
- `ClientPacketSession`: Класс для управления сессией пакетов
- `ActionsBotModule`: Модуль действий бота
- `DataBase`: База данных парсеров
- `BotPacketController`: Контроллер пакетов

---

## Методы

### `constructor(version)`
Создает экземпляр валидатора для конкретной версии.

**Параметры**:
- `version` (`string`): Версия Minecraft Bedrock (например, `'1.21.50'`, `'1.20.0'` и т.д.)

**Пример**:
```javascript
const validator = new ProtocolValidator('1.21.50')
```

**Примечание**: На этом этапе модули еще не загружены. Используйте `await init()` для их загрузки.

### `async init()`
Асинхронно загружает все требуемые модули протокола для версии, указанной в конструкторе.

**Процесс**:
1. Формирует путь для поиска модулей: `./Versions/v{version}/`
2. Пытается загрузить все модули из структуры `packetsStructure`
3. Если модули не найдены для точной версии, использует механизм fallback
4. Заполняет свойство `Protocol`

**Выбрасывает**: Ошибку если ни один из модулей не был успешно загружен

**Пример**:
```javascript
const validator = new ProtocolValidator('1.21.50')
await validator.init()
console.log('Protocol loaded successfully')
console.log(validator.Protocol.ClientPacketSession) // Класс
```

---

## Структура загружаемых модулей

### `packetsStructure` (статическое свойство)
Определяет структуру модулей, которые должны быть загружены для каждой версии:

```javascript
static packetsStructure = {
    ClientPacketSession: 'js',      // Управление сессией пакетов
    ActionsBotModule: 'js',         // Модуль действий
    DataBase: 'js',                 // База данных парсеров
    BotPacketController: 'js',      // Контроллер пакетов
}
```

Каждый модуль — это файл JavaScript в директории версии с названием, соответствующим ключу.

**Файловая структура**:
```
src/MainClasses/Packets/Versions/
├── v1.21/
│   ├── ClientPacketSession.js
│   ├── ActionsBotModule.js
│   ├── DataBase.js
│   ├── BotPacketController.js
│   └── ... (другие файлы версии)
├── v1.20/
│   └── ... (модули версии 1.20)
└── vDefault/
    └── ... (модули по умолчанию)
```

---

## Система fallback версий

### `fbArray` (статическое свойство)
Массив версий, используемых при fallback механизме:

```javascript
static fbArray = ['Default', '1.21']
```

### Процесс fallback

Если модули не найдены для точной версии, класс автоматически ищет их в альтернативных версиях:

1. Сначала ищет в `v{targetVersion}/`
2. Если не найдено, идет к предыдущей версии в `fbArray`
3. Продолжает до `vDefault/` (версия-ловушка)
4. Если модули не найдены нигде, останавливается с ошибкой

**Пример fallback цепи**:
- Запрос версии `1.22.0` → поиск в `v1.22.0/`
- Не найдено → поиск в `v1.21/`
- Не найдено → поиск в `vDefault/`
- Использует найденные модули

---

## Примеры использования

### Базовая инициализация
```javascript
import { ProtocolValidator } from 'minetoring'

const validator = new ProtocolValidator('1.21.50')
await validator.init()

// Доступ к модулям
const ClientPacketSession = validator.Protocol.ClientPacketSession
const DataBase = validator.Protocol.DataBase
```

### Использование с BedrockBot
```javascript
const validator = new ProtocolValidator('1.21.50')
await validator.init()

const bot = new BedrockBot()
await bot.init(options, {
    ProtocolValidator: validator
})
```

### Обработка ошибок
```javascript
const validator = new ProtocolValidator('1.21.50')

try {
    await validator.init()
    console.log(`Протокол ${validator.version} загружен`)
    
    // Использование модулей
    const ActionsBotModule = validator.Protocol.ActionsBotModule
} catch (error) {
    console.error(`Ошибка при загрузке протокола: ${error.message}`)
}
```

### Проверка версии после инициализации
```javascript
const validator = new ProtocolValidator('1.21.50')
await validator.init()

console.log(`Используемая версия: ${validator.version}`)
console.log(`Модули загружены:`)
console.log(`- ClientPacketSession: ${!!validator.Protocol.ClientPacketSession}`)
console.log(`- ActionsBotModule: ${!!validator.Protocol.ActionsBotModule}`)
console.log(`- DataBase: ${!!validator.Protocol.DataBase}`)
console.log(`- BotPacketController: ${!!validator.Protocol.BotPacketController}`)
```

---

## Технические детали

### Асинхронная загрузка модулей
Класс использует динамический `import()` для загрузки модулей в runtime, что позволяет:
- Экономить память (загружаются только нужные версии)
- Добавлять поддержку новых версий без переомпиляции
- Использовать fallback механизм для совместимости

### Обработка ошибок при загрузке
- Если файл не существует, класс пробует альтернативную версию
- Если модуль не может быть спарсен, выводит предупреждение в консоль
- Если ни один модуль не загружен, выбрасывает ошибку

### Экспорт модулей
Все загружаемые модули должны экспортировать класс как `export default`:

```javascript
// В файле v1.21/ClientPacketSession.js
export default class ClientPacketSession {
    // ...
}
```
