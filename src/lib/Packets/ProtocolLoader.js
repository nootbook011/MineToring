import { access, readdir, readFile } from "fs/promises"
import { fileURLToPath, pathToFileURL } from 'url'
import Path from 'path'

import { Versions as pVersions } from 'bedrock-protocol/src/options.js';
import { getClosestVersion } from "#extra/extraFunctions";
import { ProtocolError } from "#extra/errors";

const __filename = fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)

export class BedrockProtocol {
    version
    constructor(version) {
        this.version = version
    }
}

export class ProtocolLoader {
    static pathToVersions = Path.join(__dirname, 'Versions')

    static async getVersions() {
        const dirs = await readdir(ProtocolLoader.pathToVersions, { withFileTypes: true })
        const versions = []

        for (const version of dirs) {
            if (version.isDirectory()) versions.push(version.name.slice(1))
        }

        versions.sort((a, b) => {
            if (a === 'Default') return -1
            if (b === 'Default') return 1

            const aParts = a.split('.').map(Number)
            const bParts = b.split('.').map(Number)

            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const v1 = aParts[i] ?? 0
                const v2 = bParts[i] ?? 0
                if (v1 !== v2) return v1 - v2
            }
            return 0
        })

        return versions
    }

    static async getProtocol(version) {
        const versions = await ProtocolLoader.getVersions()
        const endVersion = getClosestVersion(version, versions)
        if (!endVersion) throw new ProtocolError(`Unsuported version by protocol: ${version}, available versions: ${JSON.stringify(versions)}`)

        return await ProtocolLoader.importProtocolModules(endVersion, versions)
    }

    static async importProtocolModules(version) {
        const stack = []

        const buildStack = async (currentVersion) => {
            stack.push(currentVersion)
            const settingsPath = Path.join(ProtocolLoader.pathToVersions, `v${currentVersion}`, 'protocol.json')

            try {
                const content = await readFile(settingsPath, 'utf8')
                const settings = JSON.parse(content)
                if (settings.dependence) {
                    await buildStack(settings.dependence)
                }
            } catch (err) { }
        }

        await buildStack(version)

        const recursImport = async (dir, targetObj) => {
            const entries = await readdir(dir, { withFileTypes: true })

            for (const entry of entries) {
                const fullPath = Path.join(dir, entry.name)

                if (entry.isDirectory()) {
                    const name = entry.name.toLowerCase()
                    targetObj[name] ??= {}
                    await recursImport(fullPath, targetObj[name])
                } else if (entry.isFile() && entry.name.endsWith('.js')) {
                    try {
                        const modulePath = pathToFileURL(fullPath).href
                        const moduleData = await import(modulePath)

                        if (moduleData?.default) {
                            const name = moduleData.default?.name || entry.name.slice(-3)
                            targetObj[name] = moduleData.default
                        }
                    } catch (err) {
                        console.warn(`Protocol => Cannot load module ${fullPath}: ${err.message}`)
                    }
                }
            }
        };

        const proto = new BedrockProtocol(version)

        const loadOrder = stack.reverse()

        for (const ver of loadOrder) {
            const versionDir = Path.join(ProtocolLoader.pathToVersions, `v${ver}`)
            await recursImport(versionDir, proto)
        }

        return proto
    }
}