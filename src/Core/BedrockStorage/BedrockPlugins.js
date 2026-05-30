import { PluginError } from '#extra/errors'
import { BaseModule } from '#Storage/moduleBase'
import { BedrockObjectStorage } from "#Storage/BedrockObjectStorage";

export class BedrockPlugins extends BedrockObjectStorage {
    #plugins = {}
    #proxy = new Proxy(this.#plugins, {
        get(target, name) {
            return target[name]
        },
        set() {
            throw new PluginError("Cannot add plugins directly. Use loadPlugins() instead.")
        }
    })

    /**
     * Provides access to the loaded plugins.
     * @returns {object}
     * @throws {PluginError} If the accessed plugin is not registered.
     */
    get plugins() { return this.#proxy }
    
    get loadedPlugins() { return { ...this.#plugins } }
    get pluginsList() { return Object.keys(this.#plugins) }
    
    /**
     * Unloads a plugin from the BedrockPlugins instance.
     * @param {BaseModule} plugin 
     * @returns {void}
     */
    unloadPlugin(plugin, name = undefined) {
        name ??= plugin?.name ?? plugin?.constructor?.name
        if (!name || !plugin) return
        
        delete this.#plugins[name]
    }
    
    /**
     * Loads a single plugin into the BedrockPlugins instance.
     * @param {BaseModule} plugin 
     * @param {string} name 
     * @returns {void}
     */
    loadPlugin(plugin, name = undefined) {
        name ??= plugin?.name ?? plugin?.constructor?.name
        if (!name || !plugin) return
        
        if (BaseModule.isPrototypeOf(plugin)) {
            try {
                plugin = new plugin(this)
            } catch(e) {
                throw new PluginError(`Failed to load plugin ${name}: ${e.message}`)
            }
        }
        if (plugin?.injector && typeof plugin.injector === 'function') {
            try {
                plugin.injector(this)
                delete plugin.injector
            } catch (e) {
                throw new PluginError(`Failed to run plugin injector ${name}: ${e.message}`)
            }
        }

        this.#plugins[name] = plugin
        return plugin
    }
    
    /**
     * Loads multiple plugins into the BedrockPlugins instance.
     * @param {object|Array} plugins - An object with plugin names as keys and plugin instances as values, or an array of plugin instances.
     * @returns {void}
     */
    loadPlugins(plugins) {
        if (!plugins) return
        
        if (plugins.constructor === Object) {
            for (const name in plugins) {
                this.loadPlugin(plugins[name], name)
            }
        }
        
        if (Array.isArray(plugins)) {
            for (const plugin of plugins) {
                this.loadPlugin(plugin)
            }
        }
    }
}