# Class: BedrockPlugins

A base class that implements a plugin and module system. It allows for the dynamic extension of bot or storage capabilities by providing a centralized mechanism for registering, unloading, and accessing various components (e.g., loggers, adapters, or packet controllers).

## Contents
- [Properties](#properties)
- [Methods](#methods)

---

## Properties

### `plugins`
**Type**: `Proxy<Object>`

Returns a proxy object that provides access to all loaded plugins by their names.

### `loadedPlugins`
**Type**: `Object`

Returns a copy of all currently registered plugins.

### `pluginsList`
**Type**: `Array<String>`

Returns an array of names for all loaded plugins.

---

## Methods

### `loadPlugin(plugin, name? = undefined)`
Registers a single plugin in the system.

**Parameters**:
- `plugin` (`Class|BaseModule`): A plugin instance or a class inheriting from `BaseModule`. If a class is passed, it will be automatically initialized, passing the current `BedrockPlugins` instance to the constructor.
- `name` (`String|undefined`): The name under which the plugin will be accessible. If not specified, the plugin's `name` property or its constructor name is used.

### `loadPlugins(plugins)`
Bulk loading of plugins.

**Parameters**:
- `plugins` (`Array<Plugin>|Object<String: Plugin>`): Plugins to load. Can be an object `{ name: pluginInstance }` or an array of plugin instances.

### `unloadPlugin(plugin)`
Removes a plugin from the system.

**Parameters**:
- `plugin` (`Class|BaseModule`): The loaded plugin object to be unloaded. After this call, the plugin will no longer be accessible via the `.plugins` property.