import { getStringFromBigInt as getKey } from "#extra/extraFunctions"
import { BedrockEntity } from "#World/BedrockEntity"
import { BedrockItemEntity } from "#World/BedrockItemEntity"
import { BedrockPlayer } from "#World/BedrockPlayer"

export class BedrockEntities {
    /** @type {Map<string, BedrockPlayer>} */
    players = new Map()
    /** @type {Map<string, BedrockItemEntity>} */
    items = new Map()
    /** @type {Map<string, BedrockEntity|BedrockPlayer|BedrockItemEntity>} */
    #byRuntime = new Map()
    /** @type {Map<string, BedrockEntity|BedrockPlayer|BedrockItemEntity>} */
    #byUnique = new Map()

    values() { return this.#byRuntime.values() }
    runtimeIds() { return this.#byRuntime.keys() }
    uniqueIds() { return this.#byUnique.keys() }
    usernames() { return this.players.keys() }
    get size() { return this.#byRuntime.size }

    setEntity(entity) {
        if (!(entity instanceof BedrockEntity)) throw new TypeError(`Expected BedrockEntity class, received: ${typeof entity}`)
        
        const { username, runtimeId, uniqueId } = entity
        if (entity instanceof BedrockPlayer) this.players.set(username, entity)
        if (entity instanceof BedrockItemEntity) this.items.set(getKey(runtimeId), entity)
        this.#byRuntime.set(getKey(runtimeId), entity)
        this.#byUnique.set(getKey(uniqueId), entity)
    }

    getEntityByRuntimeId(runtimeId) {
        return this.#byRuntime.get(getKey(runtimeId))
    }
    getEntityByUniqueId(uniqueId) {
        return this.#byUnique.get(getKey(uniqueId))
    }

    hasEntityByRuntimeId(runtimeId) {
        return this.#byRuntime.has(getKey(runtimeId))
    }
    hasEntityByUniqueId(uniqueId) {
        return this.#byUnique.has(getKey(uniqueId))
    }

    delEntity(entity) {
        if (!(entity instanceof BedrockEntity)) throw new TypeError(`Expected BedrockEntity class, received: ${typeof entity}`)
        
        const { username, runtimeId, uniqueId } = entity
        if (entity instanceof BedrockPlayer) this.players.delete(username)
        if (entity instanceof BedrockItemEntity) this.items.delete(getKey(runtimeId))
        this.#byRuntime.delete(getKey(runtimeId))
        this.#byUnique.delete(getKey(uniqueId))
        return true
    }

    clear() {
        this.players.clear()
        this.items.clear()
        this.#byRuntime.clear()
        this.#byUnique.clear()
    }
}