# 0.8.0

## 0.7.0

### Major Changes

* **Entity Support**: MineToring now supports entities! Added support for displaying all entities within bot render distance.
    * *Currently supported:* Standard entities/mobs and players.
* **EventEmitter Integration**: The `BedrockWorld`, `BedrockDimension`, `BedrockEntity`, `BedrockPlayer`, and `ActionsModule` classes now support **EventEmitter**.
    * Events are accessed via the `.events` method.
* **BedrockServer**: Introducing new `BedrockServer` class! All technical information from the `start_game` packet, as well as the current full list of players with their basic data, is now in this class.
* **Examples**: The `tests` folder is no longer used for storing demonstration code. All examples have been moved to the [`examples`](./examples) directory.
* **API Documentation**: MineToring now maintains official API documentation!
    * It will be updated and expanded in accordance with the source code.
    * It provides up-to-date and detailed information about methods, EventEmitter events, and the contents of all dynamic methods and variables within the core classes.
    * [**View the API Documentation**](./docs/EN/API.md)

---

### Technical Changes

* **Global Refactoring**: A large-scale refactoring of the core and protocols has been conducted.
    * Deep code cleanup and structural optimization performed.
    * Folders in the `src` directory have been given logical and clear names.
* **Plugin System**: Legacy `Engines` system has been completely replaced by a new plugin system. This provides a more modern and performant API for extending functionality.
* **Dynamic `ProtocolLoader`**: The class has been completely rewritten.
    * The main protocol class is now accessible via a static method without the need for manual validation.
    * Loading is now dynamic: any `default export` from a JS file in the protocol folder is loaded automatically.
    * The `DataBase` module has been deprecated and completely removed from the project.
* **Bug Fixes**: Numerous minor bugs and errors have been resolved.

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