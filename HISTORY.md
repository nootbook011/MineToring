# 0.6
* **blobs support**: Now ClientPacketsSession module able to work with cache mode enabled, keep in mind: offical client never requests payload data for level-chunk, so you will only have data for sub-chunks.
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