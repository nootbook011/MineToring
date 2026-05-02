# Class: Logger

Утилита для логирования событий и ошибок в фреймворке MineToring. Класс поддерживает логирование в консоль и в файлы с различными уровнями детальности.

## Содержание
- [Уровни логирования](#уровни-логирования)
- [Конструктор](#конструктор)
- [Методы](#методы)
- [Примеры использования](#примеры-использования)

---

## Уровни логирования

Доступны через статическое свойство `Logger.LEVELS`:

| Уровень | Значение | Описание |
| :--- | :--- | :--- |
| `debug` | `0` | Максимум информации (все логи) |
| `warn` | `2` | Предупреждения и выше |
| `error` | `3` | Только ошибки |

**Поведение**: Если установлен уровень `2`, то логи уровня `debug` (0) будут пропущены, но `warn` (2) и `error` (3) будут записаны.

---

## Конструктор

### `constructor(level, timestamp?, logPath?, logsName?)`

Создает экземпляр логгера.

**Параметры**:
- `level` (`number`): Уровень логирования (0 = все логи, выше = меньше логов). Используйте `Logger.LEVELS` для удобства.
- `timestamp` (`string | undefined`): Временная метка для имени файла. По умолчанию генерируется автоматически.
- `logPath` (`string | undefined`): Путь к директории для сохранения логов. Если пусто, логи не сохраняются в файл.
- `logsName` (`string | undefined`): Префикс имени файла логов. По умолчанию `'logFile'`.

**Примеры**:
```javascript
// Логирование только в консоль
const logger = new Logger(0)

// Логирование в консоль и в файл
const logger = new Logger(
    0,                      // Уровень: все логи
    undefined,              // Автогенерированная временная метка
    './logs',               // Директория логов
    'myBot'                 // Префикс файла (будет: myBot2024-01-15T10.30.45.123Z.log)
)

// Только ошибки
const logger = new Logger(Logger.LEVELS.error)
```

---

## Методы

### `createLog(type, message, logLevel?)`

Создает новую запись лога.

**Параметры**:
- `type` (`string`): Тип лога (`'debug'`, `'warn'`, `'error'` или любая строка)
- `message` (`string`): Текст сообщения
- `logLevel` (`number | undefined`): Уровень логирования для этой записи. Если `-1` (по умолчанию), использует уровень из `Logger.LEVELS[type]`.

**Возвращает**: `boolean` - `true` если лог был создан, `false` если фильтрован по уровню

**Пример**:
```javascript
const logger = new Logger(0)

// Создать лог debug
const created = logger.createLog('debug', 'Bot started')
console.log(created) // true

// Создать лог с кастомным уровнем
logger.createLog('custom', 'Custom message', 1)
```

### `print()`

Выводит созданный лог в консоль.

**Поведение**:
- `error`: Использует `console.error()`
- `warn`: Использует `console.warn()`
- Остальные: Используют `console.log()`

**Примечание**: Если лог не был создан или пропущен фильтром, ничего не выводится.

**Пример**:
```javascript
const logger = new Logger(0)

logger.createLog('error', 'Something went wrong')
logger.print()  // Выведет в консоль красным цветом (error)
```

### `write()`

Записывает созданный лог в файл (если путь к файлу установлен).

**Требования**:
- `logPath` должен быть установлен в конструкторе
- Лог должен быть создан через `createLog()`

**Примечание**: Если `logPath` не установлен, метод просто ничего не делает.

**Пример**:
```javascript
const logger = new Logger(0, undefined, './logs')

logger.createLog('info', 'Bot initialized')
logger.print()   // Выведет в консоль
logger.write()   // Запишет в файл
```

---

## Примеры использования

### Полный цикл логирования

```javascript
import { Logger } from 'minetoring'

const logger = new Logger(
    Logger.LEVELS.debug,    // Все логи
    undefined,
    './bot_logs',           // Директория логов
    'myBot'
)

// Создать и вывести лог
logger.createLog('debug', 'Инициализация бота...')
logger.print()
logger.write()

// Лог warning
logger.createLog('warn', 'Соединение медленное')
logger.print()
logger.write()

// Лог ошибки
logger.createLog('error', 'Ошибка подключения')
logger.print()
logger.write()
```

### С фильтрацией по уровню

```javascript
const logger = new Logger(Logger.LEVELS.warn)  // Только warn и error

// Эти логи будут пропущены (уровень 0 < 2)
logger.createLog('debug', 'Debug info')        // false
logger.print()                                  // Ничего не выведет
logger.write()                                  // Ничего не запишет

// Этот лог будет учтен (уровень 2 >= 2)
logger.createLog('warn', 'Warning message')    // true
logger.print()                                  // Выведет в консоль
logger.write()                                  // Запишет в файл
```

### Встроенное использование в BedrockBot

```javascript
import { BedrockBot, BotOptions } from 'minetoring'

const bot = new BedrockBot()

const options = {
    config: {
        botDir: './bot_data',
        logging: {
            level: 0,        // Все логи
            logToFile: true  // Сохранять в файл
        }
    }
}

await bot.init(options)

// Логгер будет автоматически создан и настроен в BedrockBot
// Логи будут сохраняться в ./bot_data/logs/
```

---

## Временная метка в имени файла

При создании логгера с указанием пути, в имя файла добавляется временная метка в ISO формате:

```
myBot2024-01-15T10.30.45.123Z.log
```

Формат: `{logsName}{timestamp}.log`

Временная метка автоматически генерируется функцией `generateTimestamp()` из `extraFunctions.js`.

---

## Структура лога

Каждая запись лога содержит:

```
[ДАТА И ВРЕМЯ - ТИП] сообщение
```

Пример:
```
[15/01/2024, 10:30:45 - DEBUG] Bot started
[15/01/2024, 10:30:46 - ERROR] Connection failed
```

---

## Технические детали

### Форматирование даты и времени
Класс использует `toLocaleString('ru-RU')` для локализации даты/времени на русский язык.

### Буферизация логов
Каждый вызов `print()` и `write()` работает с последним созданным логом. Если вызвать `print()` дважды подряд, будет выведено два раза одно и то же сообщение.

### Утечка памяти
На больших объемах логирования рекомендуется очищать логи вручную, установив `this.log = null` при необходимости.
