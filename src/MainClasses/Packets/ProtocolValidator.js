import { access } from "fs/promises"
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class ProtocolValidator {
    static packetsStructure = {
        /*Level: {
            LevelDB: 'js',
            LevelDat: 'js'
        },*/
        Parsers: {
            startGamePacket: 'js',
            levelChunkPacket: 'js',
            subChunkPacket: 'js',
        },
        ClientPacketsHandler: 'js',
        AutoPacketsHandler: 'js',
        ActionsBotModule: 'js',
        DataBase: 'js',
    }
    static fbArray = ['Default', '1.21']
    version
    /**
     * @type {ProtocolValidator.packetsStructure}
     */
    Protocol

    constructor(version) {
        this.version = version
    }

    async init() {
        this.Protocol = await this.#importVersion(this.version)
    }

    async #importVersion(version) {
        const struct = ProtocolValidator.packetsStructure
        const basePath = ['./Versions', `v${version}`]

        return await this.#recursImport(struct, basePath)
    }

    async #recursImport(struct, currentPath) {
        const fbArray = ProtocolValidator.fbArray
        const fallbackImport = async (pathArr, file) => {
            let module = undefined
            let currentPathAttempt = Array.isArray(pathArr) ? [...pathArr] : [pathArr]

            while (!module) {
                const absolutePath = path.join(__dirname, ...currentPathAttempt, file)
                try {
                    await access(absolutePath)
                    try {
                        module = await import(pathToFileURL(absolutePath).href)
                    } catch(e) {
                        console.warn(`Cannot load module ${file} by external error:`, e.message)
                        break
                    }
                } catch(e) {
                    const currentVer = (currentPathAttempt[1] || '').slice(1)
                    const foundIndex = fbArray.indexOf(currentVer)
                    const nextIndex = (foundIndex === -1 ? fbArray.length : foundIndex) - 1
                    if (nextIndex < 0) break

                    const fbVersion = fbArray[nextIndex]
                    currentPathAttempt[1] = `v${fbVersion}`
                }
            }
            return module
        };

        const entries = Object.entries(struct).map(async ([name, value]) => {
            if (typeof value === 'string') {
                const module = await fallbackImport(currentPath, `${name}.${value}`)
                return [name, module?.default]
            }

            if (typeof value === 'object' && value !== null) {
                const subStruct = await this.#recursImport(value, [...currentPath, name])
                return [name, subStruct]
            }
        })

        const resolvedEntries = await Promise.all(entries)
        return Object.fromEntries(resolvedEntries)
    }
}