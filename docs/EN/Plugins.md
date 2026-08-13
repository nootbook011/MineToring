# MineToring Plugins

Plugins are modifications or extensions of MineToring core base classes. They allow for the independent addition of new functionality not provided by the standard system core.


## Plugins Types

MineToring supports various approaches to modifying base classes, depending on the required depth of integration:

| Type | Description | Implementation Example |
| :--- | :--- | :--- |
| **Extensions** | Add new methods to instances of standard classes without changing their structure. | `await Bot.init(options, { plugins: [myPlugin] })`, `Bot.loadPlugin(myPlugin)` |
| **Modifications** | Allow full control over the base class through inheritance. | `class MyBot extends BaseBedrockBot { }` |

---

## How to Create Your Own Plugin?

To create a plugin, implement it as a class that extends or modifies the functionality of MineToring base classes. The loading method depends on the type of plugin.

---

### Extensions
Standard functional extension.
* **Creation**: Use the built-in **BasePlugin** base class, inheriting from it and adding the required functionality.
* **Loading**: Load the plugin using the `.loadPlugin(plugin)` method into a class that supports extensions.
* **Example**: [PluginsExample.js](../../examples/PluginsExample.js)

---

### Modifications
Provides full control over the target class.
* **Creation**: Inheritance from the target base class.
* **Example**: [BedrockBot.js](/src/lib/Modify/BedrockBot.js)