# MineToring Plugins

Plugins are modifications or extensions for the MineToring core base classes. They provide independent support for new functionality that is not provided by the core by default.

---

## 🛠 Plugin Types

MineToring supports various ways to modify the main classes depending on the required depth of integration:

| Type | Description | Implementation Example |
| :--- | :--- | :--- |
| **Extensions** | Provide new methods for standard classes based on their instances. | `await Bot.init({ plugins: [myPlugin] })` |
| **Modifications** | Use inheritance of the target core base class for total control over it. | `class MyBot extends BaseBedrockBot { }` |
| **Adapters** | Serve as layers for third-party network data decoding libraries (payload). | [Base Adapter Class](../../src/BaseClasses/ValidateAdapter/BaseMainAdapter.js) |

---

## 📦 Built-in Plugins

MineToring includes built-in plugins to provide base functionality "out of the box". These are supplied as dependencies within the base classes and are stored in the **Main** block.

### 1. Plugins: Extensions
These plugins are stored in the packets folder and are loaded dynamically depending on the game version:

* **ClientPacketSession**: Automated packet management.
* **ActionsModule**: Ready-to-use methods for bot control.

### 2. Plugins: Modifications
These plugins are located in the **Modify** folder:

* **BedrockBot**: An advanced version of the client providing extended functionality.

### 3. Plugins: Adapters
Stored in directories with the **Adapters** suffix. Thanks to them, MineToring can work with any decoding libraries, not limited to the standard `prismarine-chunk`:

* **PrismarineAdapters**: Base adapters for the popular Prismarine-chunk library.