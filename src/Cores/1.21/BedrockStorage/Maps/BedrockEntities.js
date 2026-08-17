import { BedrockEntity, BedrockItemEntity, BedrockPlayer } from "../../index.js"
import { parseLi64 } from "#extra/extraFunctions"

function getKey(id) {
    if (typeof id === 'bigint' || typeof id === 'number') return id.toString()
    if (Array.isArray(id)) return parseLi64(id).toString()
    return id
}

export class BedrockEntities {
    /** @type {Object<string, BedrockPlayer>} */
    #players = {}
    /** @type {Map<string, BedrockItemEntity} */
    #items = new Map()
    /** @type {Map<string, BedrockEntity|BedrockPlayer>} */
    #byRuntime = new Map()
    /** @type {Map<string, BedrockEntity|BedrockPlayer>} */
    #byUnique = new Map()

    get values() { return this.#byRuntime.values() }
    get runtimeIds() { return this.#byRuntime.keys() }
    get uniqueIds() { return this.#byUnique.keys() }
    get usernames() { return Object.keys(this.#players) }
    get size() { return this.#byRuntime.size }
    get players() { return this.#players }
    get items() { return this.#items }

    setEntity(entity) {
        const { username, runtimeId, uniqueId } = entity
        if (entity instanceof BedrockPlayer) this.#players[username] = entity
        if (entity instanceof BedrockItemEntity) this.#items.set(getKey(runtimeId), entity)
        this.#byRuntime.set(getKey(runtimeId), entity)
        this.#byUnique.set(getKey(uniqueId), entity)
    }

    getEntity(id) {
        return this.#byRuntime.get(getKey(id)) || this.#byUnique.get(getKey(id))
    }

    hasEntity(id) {
        return this.#byRuntime.has(getKey(id)) || this.#byUnique.has(getKey(id))
    }

    delEntity(id) {
        const entity = this.getEntity(id)
        if (!entity) return false

        const { username, runtimeId, uniqueId } = entity
        if (entity instanceof BedrockPlayer) delete this.#players[username]
        if (entity instanceof BedrockItemEntity) this.#items.delete(getKey(runtimeId))
        this.#byRuntime.delete(getKey(runtimeId))
        this.#byUnique.delete(getKey(uniqueId))
        return true
    }

    clear() {
        this.#byRuntime.clear()
        this.#byUnique.clear()
    }
}