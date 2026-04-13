export class BedrockEntities {
    #entities = {
        runtimeid: new Map(),
        uniqueid: new Map()
    }

    get values() { return this.#entities.runtimeid.values() }
    get size() { return this.#entities.runtimeid.size }

    #getKey(id) {
        return typeof id === 'bigint' ? id.toString() : id
    }

    #builder(ids, action) {
        const { runtime, unique } = ids
        if (runtime) return this.#entities.runtimeid?.[action](this.#getKey(runtime))
        if (unique) return this.#entities.uniqueid?.[action](this.#getKey(unique))
    }

    setEntity(entity, ids) {
        this.#entities.runtimeid.set(this.#getKey(ids.runtime), entity)
        this.#entities.uniqueid.set(this.#getKey(ids.unique), entity)
    }

    getEntity(ids) {
        return this.#builder(ids, 'get')
    }

    hasEntity(ids) {
        return this.#builder(ids, 'has') 
    }

    delEntity(ids) {
        this.#entities.runtimeid.delete(this.#getKey(ids.runtime))
        this.#entities.uniqueid.delete(this.#getKey(ids.unique))
    }

    clear() {
        this.#entities.runtimeid.clear()
        this.#entities.uniqueid.clear()
    }
}