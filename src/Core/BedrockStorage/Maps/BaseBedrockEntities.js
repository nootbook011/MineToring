import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer"
import { parseLi64 } from "#extra/extraFunctions"

function getKey(id) {
    if (typeof id === 'bigint' || typeof id === 'number') return id.toString()
    if (Array.isArray(id)) return parseLi64(id).toString()
    return id
}

export class BedrockEntities {
    #players = {}
    #byRuntime = new Map()
    #byUnique = new Map()

    get values() { return this.#byRuntime.values() }
    get runtimeIds() { return this.#byRuntime.keys() }
    get uniqueIds() { return this.#byUnique.keys() }
    get usernames() { return Object.keys(this.#players) }
    get size() { return this.#byRuntime.size }
    get players() { return this.#players }

    setEntity(entity) {
        const { username, runtimeId, uniqueId } = entity
        if (entity instanceof BedrockPlayer) this.#players[username] = entity
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
        this.#byRuntime.delete(getKey(runtimeId))
        this.#byUnique.delete(getKey(uniqueId))
        return true
    }

    clear() {
        this.#byRuntime.clear()
        this.#byUnique.clear()
    }
}