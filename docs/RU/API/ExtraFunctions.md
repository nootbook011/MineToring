# Extra Functions (Вспомогательные функции)

Коллекция утилитарных функций для обработки данных, работы с типами и преобразованиями. Расположены в `src/extra/extraFunctions.js`.

## Содержание
- [Функции типизации](#функции-типизации)
- [Функции работы с массивами](#функции-работы-с-массивами)
- [Функции работы с BigInt](#функции-работы-с-bigint)
- [Функции работы с объектами](#функции-работы-с-объектами)
- [Функции для читаемости](#функции-для-читаемости)
- [Другие функции](#другие-функции)

---

## Функции типизации

### `deepTypeof(value)`

Определяет глубокий тип значения с повышенной точностью.

**Параметры**:
- `value` (`any`): Значение для проверки

**Возвращает**: `string` - Название типа

**Примеры типов**:
- `'null'` — null
- `'array'` — массив
- `'buffer'` — Buffer или Uint8Array
- `'object'` — простой объект
- `'string'`, `'number'`, `'boolean'` — примитивные типы
- `'ClassName'` — имя конструктора класса

**Пример**:
```javascript
import { deepTypeof } from 'minetoring'

console.log(deepTypeof([1, 2, 3]))           // 'array'
console.log(deepTypeof(null))                // 'null'
console.log(deepTypeof({a: 1}))              // 'object'
console.log(deepTypeof(new MyClass()))       // 'MyClass'
```

---

## Функции работы с массивами

### `arrayToSet(array, set)`

Переносит все элементы массива в Set.

**Параметры**:
- `array` (`Array`): Исходный массив
- `set` (`Set`): Целевой Set

**Пример**:
```javascript
const arr = [1, 2, 3, 4, 5]
const mySet = new Set()
arrayToSet(arr, mySet)
console.log(mySet) // Set { 1, 2, 3, 4, 5 }
```

---

## Функции работы с BigInt

### `parseLi64(parts)`

Парсит 64-битное знаковое целое число из двух частей.

**Параметры**:
- `parts` (`[high, low] | BigInt`): Две части числа (high и low) или одно BigInt

**Возвращает**: `BigInt` (знаковое)

**Пример**:
```javascript
const result = parseLi64([0, 100])  // Составит число из двух частей
```

### `parseLu64(parts)`

Парсит 64-битное беззнаковое целое число из двух частей.

**Параметры**:
- `parts` (`[low, high] | BigInt`): Две части числа или одно BigInt

**Возвращает**: `BigInt` (беззнаковое)

### `BigIntToLu64(bigInt)`

Преобразует 64-битное число в массив двух частей `[low, high]`.

**Параметры**:
- `bigInt` (`BigInt | number`): 64-битное число

**Возвращает**: `[low: number, high: number]`

**Пример**:
```javascript
const big = 12345678901234567890n
const [low, high] = BigIntToLu64(big)
console.log(low, high)  // Две части числа
```

---

## Функции работы с объектами

### `safeUpdate(target, source, checker, options?)`

Безопасно обновляет объект `target` значениями из `source`, проверяя типы против `checker`.

**Параметры**:
- `target` (`Object`): Объект для обновления
- `source` (`Object`): Объект с новыми значениями
- `checker` (`Object`): Объект-шаблон для проверки типов
- `options` (`Object`): Опции
  - `safeTypes` (boolean): Проверять ли типы (по умолчанию `true`)

**Выбрасывает**: `SyntaxError` если ключ не в checker, `TypeError` если тип не совпадает

**Пример**:
```javascript
const target = { name: 'John', age: 30 }
const source = { name: 'Jane', age: 25 }
const checker = { name: '', age: 0 }

safeUpdate(target, source, checker)
console.log(target) // { name: 'Jane', age: 25 }
```

### `recurseUpdate(target, source)`

Рекурсивно обновляет объект `target` значениями из `source` без проверки типов.

**Параметры**:
- `target` (`Object`): Объект для обновления
- `source` (`Object`): Объект с новыми значениями

**Пример**:
```javascript
const target = { 
    config: { 
        debug: false,
        level: 1
    } 
}
const source = { 
    config: { 
        debug: true 
    } 
}

recurseUpdate(target, source)
console.log(target)
// { config: { debug: true, level: 1 } }
```

### `walk(obj, callback)`

Рекурсивно обходит объект и применяет функцию обратного вызова к каждому значению.

**Параметры**:
- `obj` (`Object | Map`): Объект или Map для обхода
- `callback` (`Object`):
  - `type` ('obj' | 'map'): Тип результата
  - `fn(key, value, obj)`: Функция для обработки каждого значения

**Возвращает**: Новый объект/Map с обработанными значениями

**Пример**:
```javascript
const obj = { 
    a: 1, 
    nested: { b: 2, c: 3 } 
}

const result = walk(obj, {
    type: 'obj',
    fn: (key, value) => value * 2
})
console.log(result)
// { a: 2, nested: { b: 4, c: 6 } }
```

### `hasTrueValue(obj)`

Проверяет, содержит ли объект хотя бы одно truthy значение (рекурсивно).

**Параметры**:
- `obj` (`Object`): Объект для проверки

**Возвращает**: `boolean`

**Пример**:
```javascript
console.log(hasTrueValue({ a: false, b: 0 }))      // false
console.log(hasTrueValue({ a: false, b: 'text' })) // true
console.log(hasTrueValue({ nested: { value: 1 } }))// true
```

### `createReadOnlyProxy(target)`

Создает read-only прокси объекта (и всех вложенных объектов).

**Параметры**:
- `target` (`Object`): Объект для защиты

**Возвращает**: `Proxy` - защищенный объект

**Пример**:
```javascript
const obj = { name: 'John', age: 30 }
const readOnly = createReadOnlyProxy(obj)

console.log(readOnly.name) // 'John'
readOnly.name = 'Jane'      // false (молча игнорируется или вызывает ошибку)
```

### `deepCopy(obj)`

Создает глубокую копию объекта.

**Параметры**:
- `obj` (`Object`): Объект для копирования

**Возвращает**: `Object` - Новая копия объекта

**Пример**:
```javascript
const original = { a: 1, nested: { b: 2 } }
const copy = deepCopy(original)

copy.nested.b = 99
console.log(original.nested.b) // 2 (не изменилась)
```

---

## Функции для читаемости

### `sleep(ms)`

Асинхронная функция для задержки выполнения.

**Параметры**:
- `ms` (`number`): Количество миллисекунд

**Возвращает**: `Promise<void>`

**Пример**:
```javascript
await sleep(1000)  // Подождать 1 секунду
console.log('Done!')
```

### `generateTimestamp()`

Генерирует временную метку в формате ISO с точками вместо двоеточий.

**Возвращает**: `string` - Временная метка (например, `'2024-01-15T10.30.45.123Z'`)

**Пример**:
```javascript
const timestamp = generateTimestamp()
console.log(timestamp) // '2024-01-15T10.30.45.123Z'
```

---

## Другие функции

### `decodeCommand(bufferData)`

Декодирует команду из буфера данных.

**Параметры**:
- `bufferData` (`Buffer | ArrayLike`): Буфер с данными команды

**Возвращает**: `string` - Расшифрованная команда

**Формат буфера**:
- Байт 2: Длина команды
- Байты 3+: Текст команды (UTF-8)

### `getPercent(total, part)`

Вычисляет процент.

**Параметры**:
- `total` (`number`): Общее значение
- `part` (`number`): Часть от общего

**Возвращает**: `number` - Процент (0-100)

**Пример**:
```javascript
console.log(getPercent(100, 25))  // 25
console.log(getPercent(200, 50))  // 25
console.log(getPercent(0, 10))    // 0 (защита от деления на 0)
```

### `setGetter(target, name, callback)`

Устанавливает getter на объект динамически.

**Параметры**:
- `target` (`Object`): Объект для модификации
- `name` (`string`): Имя свойства
- `callback` (`function`): Функция-getter

**Пример**:
```javascript
const obj = {}
setGetter(obj, 'square', () => 10 * 10)

console.log(obj.square) // 100
```

---

## Extra Constants (Дополнительные константы)

Находятся в `src/extra/extraConstants.js`.

### `DIMENSIONS`

Константы ID измерений Minecraft:

```javascript
{
    overworld: 0,
    nether: 1,
    the_end: 2
}
```

**Пример**:
```javascript
import { DIMENSIONS } from 'minetoring'

const overworld = world.getDimension(DIMENSIONS.overworld)
const nether = world.getDimension(DIMENSIONS.nether)
```

### `GAMEMODES`

Константы режимов игры:

```javascript
{
    survival: 0,
    creative: 1,
    adventure: 2,
    fallback: 5,
    spectator: 6
}
```

**Пример**:
```javascript
import { GAMEMODES } from 'minetoring'

if (serverGameMode === GAMEMODES.creative) {
    console.log('Creative mode')
}
```

---

## Практические примеры

### Обновление конфигурации с валидацией
```javascript
import { safeUpdate } from 'minetoring'

const currentConfig = {
    server: { host: 'localhost', port: 19132 },
    client: { username: 'Bot' }
}

const configTemplate = {
    server: { host: '', port: 0 },
    client: { username: '' }
}

const newConfig = {
    server: { host: 'example.com', port: 25565 },
    client: { username: 'NewBot' }
}

try {
    safeUpdate(currentConfig, newConfig, configTemplate)
    console.log('Config updated')
} catch (e) {
    console.error('Config update failed:', e.message)
}
```

### Глубокое копирование данных
```javascript
import { deepCopy, recurseUpdate } from 'minetoring'

const original = {
    metadata: {
        time: 12000,
        weather: 'clear'
    }
}

const modified = deepCopy(original)
recurseUpdate(modified, {
    metadata: {
        time: 18000,
        weather: 'rain'
    }
})

console.log(original.metadata.time)  // 12000
console.log(modified.metadata.time)  // 18000
```
