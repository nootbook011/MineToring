# Class: BedrockPlugins inherits [BedrockDependencies](./BedrockDependencies.md)

Base class implementing a plugin and module system. It allows dynamic extension of bot or storage capabilities, providing a centralized mechanism for registering, unloading, and accessing various components (such as loggers, adapters, or packet controllers).

## Contents
- [Properties](#properties)
  - [plugins](#plugins)
  - [loadedPlugins](#loadedplugins)
  - [pluginsList](#pluginslist)
- [Methods](#methods)
  - [loadPlugin(plugin, name? = undefined)](#loadpluginplugin-name--undefined)
  - [loadPlugins(plugins)](#loadpluginsplugins)
  - [unloadPlugin(plugin)](#unloadpluginplugin)
---

## Properties

### `plugins`
**Type**: `Proxy<Object>`

Returns a proxy object providing access to all loaded plugins by their names.

### `loadedPlugins`
**Type**: `Object`

Returns a copy of all currently registered plugins.

### `pluginsList`
**Type**: `Array<String>`

Returns an array of names of all loaded plugins.

---

## Methods

### `loadPlugin(plugin, name? = undefined)`
Registers a single plugin in the system.

**Parameters**:
- `plugin` (`Class|BaseModule`): A plugin instance or a class inheriting from `BaseModule`. If a class is passed, it will be automatically instantiated, passing the current `BedrockPlugins` instance into the constructor.
- `name` (`String|undefined`): The name under which the plugin will be accessible. If not specified, the plugin's `name` property or its constructor name is used.

### `loadPlugins(plugins)`
Bulk plugin loading.

**Parameters**:
- `plugins` (`Array<Plugin>|Object<String: Plugin>`): Plugins to load. Can be an object `{ name: pluginInstance }` or an array of plugin instances.

### `unloadPlugin(plugin)`
Removes a plugin from the system.

**Parameters**:
- `plugin` (`Class|BaseModule`): The loaded plugin object to unload. After this call, the plugin will no longer be accessible via the `.plugins` property.