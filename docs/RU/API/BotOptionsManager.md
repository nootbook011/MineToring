# Class: BotOptionsManager

Центральный менеджер конфигураций бота. Он разделяет настройки на логические группы (сервер, клиент, сеть, конфигурация) и подготавливает их для корректной передачи во внутренние компоненты протокола bedrock-protocol.

## Содержание
- [Структура параметров](#структура-параметров)
- [Геттеры](#геттеры)
- [Методы конфигурации](#методы-конфигурации)
- [Примеры использования](#примеры-использования)

---

## Структура параметров
Менеджер оперирует четырьмя основными блоками настроек:

### Client (Клиент)
Данные об игроке и сессии:
```javascript
{
    username: "player",                    // Никнейм бота в игре
    session: {
        useVarious: false,                 // Использовать различные сессии
        uuid: "",                          // UUID игрока (автогенерируется)
        pfid: "",                          // PlayFab ID (автогенерируется)
        xuid: "",                          // Xbox Live ID (автогенерируется)
        devid: "",                         // Device ID (автогенерируется)
        ssignid: "",                       // Self-Signed ID (автогенерируется)
        encrypt: {
            public: "",                    // Публичный ключ шифрования
            private: ""                    // Приватный ключ шифрования
        }
    },
    customSkin: {},                        // Кастомные данные скина
    customLoginPacket: {},                 // Кастомные поля для пакета входа
    settings: {
        viewDistance: 5,                   // Дальность видимости в чанках
        cache: true,                       // Кэшировать ли чанки на диск
    }
}
```

### Server (Сервер)
Параметры подключения:
```javascript
{
    offline: true,                         // Режим оффлайна (без Xbox Live)
    version: "",                           // Версия Minecraft (например, "1.21.50")
    host: "127.0.0.1",                    // IP адрес сервера
    port: 19132,                           // Порт сервера
}
```

### Network (Сеть)
Сетевые параметры:
```javascript
{
    pingBeforeConnect: true,               // Пинговать сервер перед подключением
    clientConnectTimeout: 0,               // Тайм-аут подключения (мс, 0 = бесконечно)
}
```

### Config (Конфигурация)
Специфичные настройки MineToring:
```javascript
{
    botDir: null,                          // Директория для логов и кэша (null = отключено)
    simulateChunksLoading: true,           // Имитировать загрузку чанков (может замедлить инициализацию)
    logging: {
        level: 0,                          // 0 - полное логирование, 1 - инфо, 2 - предупреждения, 3 - ошибки, 4 - отключено
        logToFile: false,                  // Сохранять логи в файл (требует botDir)
        deeplogging: true,                 // Детальное логирование внутренних событий
    }
}
```

---

## Геттеры

### `clientOptions`
**Возвращаемый тип**: `Object` (bedrock-protocol compatible)

Возвращает объект, полностью совместимый с форматом настроек `bedrock-protocol`. Этот геттер автоматически собирает и трансформирует данные из разных блоков (сервер, клиент, сеть) в один плоский объект для инициализации внутреннего клиента.

**Генерируемые поля**:
- `username`: из `client.username`
- `skinData`: объединение `client.customLoginPacket` и `client.customSkin`
- `connectTimeout`: из `network.clientConnectTimeout`
- `followPort`: всегда `true`
- `delayedInit`: всегда `true`
- `conLog`: всегда `false`
- `autoInitPlayer`: противоположно `config.simulateChunksLoading`
- Все поля из `server`

### `options`
**Возвращаемый тип**: `baseOptions` (вся конфигурация)

Возвращает полный объект со всеми четырьмя блоками настроек.

### `client`
**Возвращаемый тип**: `Object`

Возвращает блок настроек клиента.

### `server`
**Возвращаемый тип**: `Object`

Возвращает блок настроек сервера.

### `network`
**Возвращаемый тип**: `Object`

Возвращает блок настроек сети.

### `config`
**Возвращаемый тип**: `Object`

Возвращает блок конфигурации бота.

---

## Методы конфигурации

Все методы используют безопасное обновление (`safeUpdate`), что гарантирует сохранение базовых значений по умолчанию, если новые данные не переданы.

### `constructor(options = {})`
Инициализирует менеджер с заданными опциями или со значениями по умолчанию.

**Параметры**:
- `options` (`Object`): Объект с настройками (может быть частичным)

**Пример**:
```javascript
const options = {
    server: {
        host: 'example.com',
        port: 19132
    },
    client: {
        username: 'MyBot'
    }
}
const manager = new BotOptionsManager(options)
```

### `configClient(values)`
Обновляет блок настроек клиента.

**Параметры**:
- `values` (`Object`): Частичный объект с новыми настройками клиента

**Пример**:
```javascript
manager.configClient({
    username: 'NewName',
    settings: {
        viewDistance: 8
    }
})
```

### `configServer(values)`
Обновляет блок настроек сервера.

**Параметры**:
- `values` (`Object`): Объект с параметрами подключения

**Пример**:
```javascript
manager.configServer({
    host: '192.168.1.100',
    port: 25565
})
```

### `configNetwork(values)`
Обновляет сетевые параметры.

**Параметры**:
- `values` (`Object`): Объект с сетевыми настройками

**Пример**:
```javascript
manager.configNetwork({
    clientConnectTimeout: 5000,
    pingBeforeConnect: false
})
```

### `configBotConfig(values)`
Обновляет конфигурацию поведения бота MineToring.

**Параметры**:
- `values` (`Object`): Объект с параметрами бота

**Пример**:
```javascript
manager.configBotConfig({
    botDir: './bot_cache',
    logging: {
        level: 1,
        logToFile: true
    }
})
```

---

## Примеры использования

### Создание конфигурации с нуля
```javascript
import { BotOptionsManager } from 'minetoring'

const options = new BotOptionsManager({
    server: {
        host: 'localhost',
        port: 19132,
        version: '1.21.50',
        offline: true
    },
    client: {
        username: 'TestBot'
    },
    config: {
        botDir: './bot_data',
        logging: {
            level: 0,
            logToFile: true
        }
    }
})

console.log(options.server.host) // localhost
console.log(options.client.username) // TestBot
```

### Модификация существующей конфигурации
```javascript
const manager = new BotOptionsManager()

// Обновить данные сервера
manager.configServer({
    host: 'realm.example.com',
    port: 25565
})

// Обновить параметры логирования
manager.configBotConfig({
    logging: {
        level: 2,
        logToFile: true
    }
})

// Получить готовые параметры для bedrock-protocol
const clientOpts = manager.clientOptions
console.log(clientOpts.username) // player
console.log(clientOpts.host) // realm.example.com
```

### Работа с сессией
```javascript
const manager = new BotOptionsManager()

// Использовать сохранённую сессию
manager.configClient({
    session: {
        uuid: 'saved-uuid-here',
        xuid: 'saved-xuid-here',
        encrypt: {
            public: 'saved-public-key',
            private: 'saved-private-key'
        }
    }
})

// Получить текущую сессию для сохранения
const currentSession = manager.client.session
console.log(currentSession.uuid) // saved-uuid-here
```