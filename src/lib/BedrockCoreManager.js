import { Versions as pVersions } from 'bedrock-protocol/src/options.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pathToCoresFolder = path.join(__dirname, '../Cores')

class BedrockCore {
    #version = ''
    get version() { return this.#version }

    constructor(version, coreModule) {
        this.#version = version
        Object.assign(this, coreModule)
    }
}

async function getCoresList() {
    try {
        await fs.access(pathToCoresFolder);
    } catch {
        throw new Error(`Cannot access base Cores directory at: ${pathToCoresFolder}`)
    }

    const cores = new Map()
    const entries = await fs.readdir(pathToCoresFolder, { withFileTypes: true })

    for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const folderName = entry.name
        const coreJsonPath = path.join(pathToCoresFolder, folderName, 'core.json')
        const indexPath = path.join(pathToCoresFolder, folderName, 'index.js')

        try {
            const coreFile = await fs.readFile(coreJsonPath, 'utf-8')
            cores.set(folderName, {
                metadata: JSON.parse(coreFile),
                indexPath: indexPath
            })
        } catch (e) {
            console.warn(`[Cores] Warning: Could not load core.json for "${folderName}": ${e.message}`)
        }
    }

    return cores
}

/**
 * @param {number|string} version Minecraft Bedrock Protocol Version 
 * @returns {typeof import("../Cores/1.21/index.js")}
 */
export async function getBedrockCore(version) {
    const numericVersion = Number(version)
    if (Number.isNaN(numericVersion)) throw new TypeError('Version must be a valid number')

    const cores = await getCoresList()
    if (cores.size === 0) throw new Error('No valid cores found in Cores directory')

    for (const [coreKey, { metadata, indexPath }] of cores) {
        const [min, max] = metadata?.protocolVersions ?? [0, 0]

        if (numericVersion >= min && numericVersion <= max) {
            const moduleUrl = pathToFileURL(indexPath).href
            const indexModule = await import(moduleUrl)
            
            return new BedrockCore(coreKey, indexModule)
        }
    }

    return null
}