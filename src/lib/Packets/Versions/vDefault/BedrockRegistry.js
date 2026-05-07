import mcData from "minecraft-data"
import loader from "prismarine-registry/lib/loader.js"

/**
 * @typedef {import('minecraft-data').IndexedData} IndexedData
 */

class bedrockRegistry {
    constructor(bedrockVersion) {
        const staticData = mcData(`bedrock_${bedrockVersion}`)
        if (!staticData) {
            throw new Error('Do not have data for ' + bedrockVersion)
        }
        const data = loader(staticData)
        Object.assign(this, data)
    }
}


/** @type {new (bedrockVersion: string) => bedrockRegistry & IndexedData} */
export default /** @type {any} */ (bedrockRegistry);