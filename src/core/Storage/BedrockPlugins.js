import { PluginError } from '#extra/errors'
import { BaseModule } from '#Core/Storage/moduleBase'

export class BedrockPlugins {
    plugins = {}
    
    get loadedPlugins() { return { ...this.plugins } }
    get pluginsList() { return Object.keys(this.plugins) }
    
    /**
     * Unloads a plugin from the BedrockPlugins instance.
     * @param {BaseModule} plugin 
     * @returns {void}
     */
    unloadPlugin(plugin, name = undefined) {
        name ??= plugin?.name ?? plugin?.constructor?.name
        if (!name || !plugin) return
        
        delete this.plugins[name]
    }
    
    /**
     * Loads a single plugin into the BedrockPlugins instance.
     * @param {BaseModule} plugin 
     * @param {string} name 
     * @returns {BaseModule} Returns the same plugin that was added.
     */
    loadPlugin(plugin, name = undefined) {
        name ??= plugin?.name ?? plugin?.constructor?.name
        if (!name || !plugin) return
        
        if (BaseModule.isPrototypeOf(plugin) || typeof plugin === 'function') {
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

        this.plugins[name] = plugin
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