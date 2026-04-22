# 0.7.0
* **Новые плагины**: Полномасштабный рефакторинг старой системы Engines - плагины которые предоставляют более лучшее и современное API.
* **Поддержка сущностей**: Теперь MineToring поддерживает сущностей! Вы можете видеть всех существ в радиусе прорисовке бота. Сейчас поддерживаются только обычные сущности и игроки.
* **Поддержка EventEmitters**: Теперь такие классы как **BedrockDimension**, **BedrockEntity**, **BedrockPlayer** и **ActionsModule** поддерживают события EventEmitter.
* **

## 0.6.1
* **Data loss fixed**: Fixed SubChunks loss.

## 0.6
* **Now in Open Source**

* **Bot Load Test**: Added clientWorldData test in clients tests section, this test checks for data lose and verifies bot performance.
* **Stable Loading Systems**: Following a comprehensive refactoring of SubChunks and Blobs systems, data loss has been eliminated across all volume scales. This update significantly enhances overall system throughput and operational stability.
* **blobs support**: Now ClientPacketsSession module able to work with cache mode enabled.
* **improved client imitation**: You can now enable simulateChunksLoading in the BedrockBot options config. This mode ensures the bot waits for all level_chunk/subchunk packets within view distance to be received, which may slightly increase initialization time.
* **Refactor and cleanUp**: Legacy PacketsMain and PacketsAuto classes have been replaced by a unified ClientPacketsSession. This consolidates their functionality into a monolithic architecture while streamlining the remaining codebase.

## 0.5
* **Adapters**: Now you can change standard network data processing lib by writing your own simple adapter.
* **Plugins**: Now you can upload your own plugins directly to the base class of bot.
* **DataBase**: Now the storage classes from the core take their metadata from protocol class.
* **BugFix and CleanUp**: Some BugFix and clean in tests.

## 0.4
**Global Refactoring**: improved bot client, dynamic protocol imports.

## 0.3
Refactoring: introduced Dimension, World, and Server classes.

## 0.2
Added classes for storing Chunks and Sub-chunks.


## 0.1
Initial client and base methods.