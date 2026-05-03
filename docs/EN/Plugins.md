# MineToring Plugins

Plugins are modifications or extensions of MineToring core base classes. They allow for the independent addition of new functionality not provided by the standard system core.


## Plugins Types

MineToring supports various approaches to modifying base classes, depending on the required depth of integration:

| Type | Description | Implementation Example |
| :--- | :--- | :--- |
| **Extensions** | Add new methods to instances of standard classes without changing their structure. | `await Bot.init(options, { plugins: [myPlugin] })`, `Bot.loadPlugin(myPlugin)` |
| **Modifications** | Allow full control over the base class through inheritance. | `class MyBot extends BaseBedrockBot { }` |
| **Adapters** | Provide integration with external libraries for decoding network data. | [Base Adapter Class](../../src/BaseClasses/ValidateAdapter/BaseMainAdapter.js) |

---

## How to Create Your Own Plugin?

To create a plugin, implement it as a class that extends or modifies the functionality of MineToring base classes. The loading method depends on the type of plugin.

---

### Extensions
Standard functional extension.
* **Creation**: Use the built-in **BasePlugin** base class, inheriting from it and adding the required functionality.
* **Loading**: Load the plugin using the `.loadPlugin(plugin)` method into a class that supports extensions.
* **Example**: [PluginsExample.js](../../tests/client/PluginsExample.js)

---

### Modifications
Provides full control over the target class.
* **Creation**: Inheritance from the target base class.
* **Example**: [BedrockBot.js](/src/MainClasses/Modify/Client/BedrockBot.js)

---

### Adapters
Specialized plugins for compatibility with network data decoding libraries. These require knowledge of the target library's API.
* **Creation**: Inherit the adapter from the **Base Adapter Class** and implement the decoding logic.
* **Loading**: Pass the adapter as a dependency during initialization: `Bot.init(options, { ValidateAdapter: Adapter })`
* **Example**: [PrismarineAdapter.js](../../src/MainClasses/PrismarineAdapters/PrismarineAdapter.js)

---

## Built-in Plugins

MineToring comes with built-in plugins that provide basic functionality. They are integrated as dependencies in the base classes.

### 1. Plugins: Extensions
Used as base class dependencies; they can also be loaded dynamically depending on the version:

* **Logger**: A utility class for logging.
* **BotPacketController**: Serves as a bridge between packets and the bot's base class.
* **DataBase**: Dynamically loads packet parsers for base classes.
* **ClientPacketSession**: Provides automatic management of network packets.
* **ActionsModule**: Provides ready-to-use methods for bot control.

### 2. Plugins: Modifications
Located in the **Modify** folder:

* **BedrockBot**: An enhanced version of the client with expanded capabilities.

### 3. Plugins: Adapters
Located in directories with the **Adapters** suffix. These allow for interaction with various decoding libraries, not limited to the standard `prismarine-chunk`:

* **PrismarineAdapters**: Standard adapters for the Prismarine-chunk library.