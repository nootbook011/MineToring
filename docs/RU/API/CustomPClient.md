# Class: CustomPClient наследует Client (из bedrock-protocol)

Расширение стандартного класса `Client` из библиотеки `bedrock-protocol`. Основная задача класса — обеспечить персистентность сессий (сохранение XUID, UUID и ключей шифрования) и автоматическую генерацию уникальных идентификаторов клиента для имитации реального устройства.

## Содержание

- [Управление сессией](#управление-сессией)
- [Свойства](#свойства)
- [Методы](#методы)
- [События](#события)
- [Система шифрования](#система-шифрования)
- [Примеры использования](#примеры-использования)

---

## Управление сессией

Класс автоматически валидирует и дополняет данные сессии при создании. Если данные не предоставлены, генерируются случайные значения для имитации реального устройства.

### Структура сессии

```javascript
{
    isCustom: boolean,              // Является ли сессия кастомной
    useVarious: boolean,            // Использовать различные сессии
    uuid: string,                   // UUID игрока
    xuid: string,                   // Xbox Live ID
    pfid: string,                   // PlayFab ID (генерируется автоматически)
    devid: string,                  // Device ID (генерируется автоматически)
    ssignid: string,                // Self-Signed ID (генерируется автоматически)
    encrypt: {
        public: string,             // Публичный ключ шифрования ECDH
        private: string             // Приватный ключ шифрования ECDH
    }
}
```

**Рекомендация**: Сохраняйте данные сессии после успешного входа, чтобы при следующем запуске бот определялся сервером как тот же самый игрок.

Для подробной информации о сессиях обратитесь к [документации ClientSessions](../ClientSessions.md).

---

## Свойства

### `isInit`

**Тип**: `boolean`

Булево значение, указывающее, был ли вызван метод `init()`. До вызова `init()` значение `false`.

**Пример**:

```javascript
const client = new CustomPClient(options)
console.log(client.isInit) // false
client.init()
console.log(client.isInit) // true
```

### `session`

**Тип**: `object`

Геттер, возвращающий глубокую копию текущей сессии клиента. Это защищает внутренние данные от внешних модификаций.

**Рекомендация**: Сохраняйте эти данные после успешного входа на сервер.

**Пример**:

```javascript
const currentSession = client.session
console.log(currentSession.uuid)      // UUID игрока
console.log(currentSession.xuid)      // Xbox ID
console.log(currentSession.encrypt)   // Ключи шифрования

// Сохранить сессию
saveSessionToFile(currentSession)
```

---

## Методы

### `constructor(options, session?, log?)`

Создает экземпляр кастомного клиента.

**Параметры**:

- `options` (`clientOptions`): Объект настроек `bedrock-protocol` (хост, порт, username и т.д.)
- `session` (`object | undefined`): Существующая сессия для восстановления подключения (опционально)
- `log` (`function | undefined`): Функция для логирования внутренних процессов (опционально)

**Процесс инициализации в конструкторе**:

1. Валидирует и дополняет данные сессии
2. Генерирует отсутствующие идентификаторы (PlayFabId, DeviceId, SelfSignedId)
3. Вызывает конструктор родителя `Client`
4. Инициализирует внутренние флаги и ссылки

**Пример**:

```javascript
// Создание нового клиента
const client = new CustomPClient(options)

// Восстановление клиента из сохраненной сессии
const savedSession = loadSessionFromFile()
const client = new CustomPClient(options, savedSession)

// С логированием
const client = new CustomPClient(
    options,
    savedSession,
    (message) => console.log(message)
)
```

### `init()`

Инициализирует базовый протокол `bedrock-protocol` и применяет сохраненные ключи шифрования из сессии (если они есть).

**Процесс**:

1. Вызывает `super.init()` для инициализации родительского класса
2. Устанавливает `isInit = true`
3. Применяет сохраненные ключи шифрования через `#applySavedKeys()`

**Пример**:

```javascript
const client = new CustomPClient(options)
client.init()
// Теперь клиент готов к подключению
```

---

## События

Класс наследует все события из `bedrock-protocol/Client` и добавляет:

| Событие | Параметры | Описание |
| :--- | :--- | :--- |
| `connect_allowed` | - | Соединение разрешено |
| `session` | `sessionData: Object` | Сессия инициирована |
| `spawn` | - | Бот заспавнился в мире |
| `kick` | `reason: string` | Бот был выгнан |
| `close` | - | Соединение закрыто |
| `packet` | `packet: Object` | Получен/отправлен пакет |

**Пример обработки событий**:

```javascript
client.on('connect_allowed', () => {
    console.log('Соединение установлено')
})

client.on('spawn', () => {
    console.log('Бот заспавнился')
})

client.on('kick', (reason) => {
    console.log(`Бот выгнан: ${reason}`)
})

client.on('close', () => {
    console.log('Соединение закрыто')
})
```

---

## Система шифрования

### Механизм сохранения ключей

Класс перехватывает процесс генерации ключей ECDH. Если в предоставленной сессии уже есть ключи, `CustomPClient` подставит их вместо генерации новых:

1. При создании клиента генерируется новая пара ключей
2. Если сессия содержит `encrypt.public` и `encrypt.private`, они сохраняются
3. Перед подключением (`_connect`) класс проверяет наличие сохраненных ключей
4. Если сохраненные ключи существуют, они используются вместо новых

**Критическая важность**: Для долгосрочных сессий необходимо сохранять и восстанавливать ключи шифрования, чтобы избежать постоянного ручного подтверждения на сервере.

### Валидация ключей

При использовании сохраненной сессии класс проверяет:

- Соответствие сохраненного PublicKey с сгенерированным
- Соответствие сохраненного PrivateKey с сгенерированным
- Если ключи не совпадают, выводит предупреждение

---

## Примеры использования

### Полный цикл сохранения и восстановления сессии

```javascript
import { CustomPClient } from 'minetoring'
import fs from 'fs'

const options = {
    host: 'localhost',
    port: 19132,
    username: 'TestBot'
}

// --- ПЕРВОЕ ПОДКЛЮЧЕНИЕ (сессия сохраняется) ---
let client = new CustomPClient(options)
client.init()
client.connect()

client.on('spawn', () => {
    // Сохранить сессию после успешного входа
    const session = client.session
    fs.writeFileSync('session.json', JSON.stringify(session, null, 2))
    console.log('Сессия сохранена')
})

// --- ВТОРОЕ ПОДКЛЮЧЕНИЕ (восстановление сессии) ---
const savedSession = JSON.parse(fs.readFileSync('session.json', 'utf-8'))
client = new CustomPClient(options, savedSession)
client.init()
client.connect()

client.on('spawn', () => {
    console.log('Подключение восстановлено из сохраненной сессии')
})
```

### С логированием

```javascript
const logger = (message) => {
    console.log(`[CustomPClient] ${message}`)
}

const client = new CustomPClient(options, savedSession, logger)
client.init()
```

### Обработка ошибок подключения

```javascript
const client = new CustomPClient(options)
client.init()

client.on('connect_allowed', () => {
    console.log('Подключение разрешено')
})

client.on('kick', (reason) => {
    console.log(`Бот выгнан: ${reason}`)
    // Попытка переподключения с новой сессией
})

client.on('close', () => {
    console.log('Соединение закрыто')
})

try {
    client.connect()
} catch (error) {
    console.error(`Ошибка подключения: ${error.message}`)
}
```

---

## Технические детали

### Валидация сессии

При создании экземпляра класс вызывает `validateSession()`, которая:

1. Проверяет, является ли сессия кастомной
2. Генерирует отсутствующие поля (pfid, devid, ssignid)
3. Объединяет сессию с параметрами шифрования

### Применение сохраненных ключей

Метод `#applySavedKeys()` применяет сохраненные ключи ECDH при условии:

- `session.isCustom === true`
- `session.useVarious === false`
- `session.encrypt.public` и `session.encrypt.private` существуют

### Сетевая трансмиссия

Класс использует `bedrock-protocol` для низкоуровневого управления пакетами и соединением. Кроме того, он добавляет высокоуровневый интерфейс для работы с сессиями.
