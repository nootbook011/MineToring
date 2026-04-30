import { parseLi64 } from "#extra/extraFunctions"

export class BedrockPlayerList {
    #byName = new Map()
    #byUUID = new Map()
    #byUnique = new Map()

    get size() { return this.#byName.size }
    get values() { return this.#byName.values() }
    get usernames() { return this.#byName.keys() }
    get uniqueIds() { return this.#byUnique.keys() }
    get uuids() { return this.#byUUID.keys() }

    #getKey(id) {
        if (typeof id === 'bigint' || typeof id === 'number') return id.toString()
        if (Array.isArray(id)) return parseLi64(id).toString()
        return id
    }

    setPlayer(BedrockPlayer) {
        const { username, uuid, id } = BedrockPlayer.metadata 
        
        this.#byName.set(username, BedrockPlayer)
        if (id.unique) this.#byUnique.set(this.#getKey(id.unique), BedrockPlayer)
        if (uuid) this.#byUUID.set(uuid, BedrockPlayer)
    }

    getPlayer(id) {
        return this.#byName.get(id) || this.#byUnique.get(this.#getKey(id)) || this.#byUUID.get(id)
    }

    hasPlayer(id) {
        return this.#byName.has(id) || this.#byUnique.has(this.#getKey(id)) || this.#byUUID.has(id)
    }

    delPlayer(id) {
        const player = this.getPlayer(id)
        if (!player) return false

        this.#byName.delete(player.metadata.username)
        this.#byUnique.delete(this.#getKey(player.metadata.id.unique))
        this.#byUUID.delete(player.metadata.uuid)
        return true
    }

    clear() {
        this.#byName.clear()
        this.#byUnique.clear()
        this.#byUUID.clear()
    }
}