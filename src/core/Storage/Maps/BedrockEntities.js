import { getStringFromBigInt as getKey } from "#extra/extraFunctions"
import { BedrockEntity } from "#World/Objects/BedrockEntity"
import { BedrockItemEntity } from "#World/Objects/BedrockItemEntity"
import { BedrockPlayer } from "#World/Objects/BedrockPlayer"

export class BedrockEntities {
    /** @type {Object<string, BedrockPlayer>} */
    players = {}
    /** @type {Map<string, BedrockItemEntity} */
    items = new Map()
    /** @type {Map<string, BedrockEntity|BedrockPlayer|BedrockItemEntity>} */
    #byRuntime = new Map()
    /** @type {Map<string, BedrockEntity|BedrockPlayer|BedrockItemEntity>} */
    #byUnique = new Map()

    get values() { return this.#byRuntime.values() }
    get runtimeIds() { return this.#byRuntime.keys() }
    get uniqueIds() { return this.#byUnique.keys() }
    get usernames() { return Object.keys(this.players) }
    get size() { return this.#byRuntime.size }

    setEntity(entity) {
        const { username, runtimeId, uniqueId } = entity
        if (entity instanceof BedrockPlayer) this.players[username] = entity
        if (entity instanceof BedrockItemEntity) this.items.set(getKey(runtimeId), entity)
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
        if (entity instanceof BedrockPlayer) delete this.players[username]
        if (entity instanceof BedrockItemEntity) this.items.delete(getKey(runtimeId))
        this.#byRuntime.delete(getKey(runtimeId))
        this.#byUnique.delete(getKey(uniqueId))
        return true
    }

    clear() {
        this.players = {}
        this.items = {}
        this.#byRuntime.clear()
        this.#byUnique.clear()
    }
}