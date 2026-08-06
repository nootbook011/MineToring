# Class: BedrockDependencies

Базовый класс для инициализации зависимостей.

## Содержание
- [Свойства](#свойства)
  - [registry](#registry)
- [Методы](#методы)
  - [constructor(registry? = undefined)](#constructorregistry--undefined)
  - [async init(version)](#async-initversion)
---

## Свойства

### `registry`
**Тип**: `BedrockRegistry|undefined`

Содержит класс регистра игры для выбранной версии если был инициализирован через конструктор или метод `.init`, в противном случае содержит ничего.

* **set**: Устанавливает новый класс `BedrockRegistry`.

---

## Методы

### `constructor(registry? = undefined)`
Устанавливает уже имеющиеся зависимости внутри класса.

**Параметры**:
- `registry` (`BedrockRegistry|undefined`): Класс регистра игры.

### `async init(version)`
Инициализирует новые зависимости внутри класса.

**Параметры**:
- `version` (`string`): Версия игры для которой будут созданы зависимости.