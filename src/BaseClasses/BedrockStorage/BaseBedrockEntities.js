import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer"
import { parseLi64 } from "#extra/extraFunctions"

export class BedrockEntities {
    #players = {}
    #entities = {
        runtimeid: new Map(),
        uniqueid: new Map()
    }

    get values() { return this.#entities.runtimeid.values() }
    get size() { return this.#entities.runtimeid.size }
    get players() { return this.#players }

    #getKey(id) {
        if (typeof id === 'bigint' || typeof id === 'number') return id.toString()
        if (Array.isArray(id)) return parseLi64(id).toString()
        return id
    }

    #builder(ids, action) {
        const { runtime, unique } = ids
        if (runtime) return this.#entities.runtimeid?.[action](this.#getKey(runtime))
        if (unique) return this.#entities.uniqueid?.[action](this.#getKey(unique))
    }

    setEntity(entity, ids) {
        if (entity instanceof BedrockPlayer) this.#players[entity.metadata.username] = entity
        this.#entities.runtimeid.set(this.#getKey(ids.runtime), entity)
        this.#entities.uniqueid.set(this.#getKey(ids.unique), entity)
    }

    getEntity(ids) {
        const data = typeof ids.runtime
        return this.#builder(ids, 'get')
    }

    hasEntity(ids) {
        return this.#builder(ids, 'has') 
    }

    delEntity(ids) {
        const entity = this.getEntity(ids)
        if (!entity) return false
        if (entity instanceof BedrockPlayer) delete this.#players[entity.metadata.username]
        this.#entities.runtimeid.delete(this.#getKey(ids.runtime))
        this.#entities.uniqueid.delete(this.#getKey(ids.unique))
        return true
    }

    clear() {
        this.#entities.runtimeid.clear()
        this.#entities.uniqueid.clear()
    }
}