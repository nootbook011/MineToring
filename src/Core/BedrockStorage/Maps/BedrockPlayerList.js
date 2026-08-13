import { parseLi64 } from "#extra/extraFunctions"

function getKey(id) {
    if (typeof id === 'bigint' || typeof id === 'number') return id.toString()
    if (Array.isArray(id)) return parseLi64(id).toString()
    return id
}

export class BedrockPlayerList {
    /** @type {Map<string, import('#Base/BedrockWorld/bedrockObjects/BedrockPlayer').BedrockPlayer>} */
    #byName = new Map()
    /** @type {Map<string, import('#Base/BedrockWorld/bedrockObjects/BedrockPlayer').BedrockPlayer>} */
    #byUUID = new Map()
    /** @type {Map<string, import('#Base/BedrockWorld/bedrockObjects/BedrockPlayer').BedrockPlayer>} */
    #byUnique = new Map()

    get size() { return this.#byName.size }
    get values() { return this.#byName.values() }
    get usernames() { return this.#byName.keys() }
    get uniqueIds() { return this.#byUnique.keys() }
    get uuids() { return this.#byUUID.keys() }

    setPlayer(BedrockPlayer) {
        const { username, uuid, uniqueId } = BedrockPlayer

        this.#byName.set(username, BedrockPlayer)
        if (uniqueId) this.#byUnique.set(getKey(uniqueId), BedrockPlayer)
        if (uuid) this.#byUUID.set(uuid, BedrockPlayer)
    }

    getPlayer(id) {
        return this.#byName.get(id) || this.#byUnique.get(getKey(id)) || this.#byUUID.get(id)
    }

    hasPlayer(id) {
        return this.#byName.has(id) || this.#byUnique.has(getKey(id)) || this.#byUUID.has(id)
    }

    delPlayer(id) {
        const player = this.getPlayer(id)
        if (!player) return false

        this.#byName.delete(player.username)
        this.#byUnique.delete(getKey(player.uniqueId))
        this.#byUUID.delete(player.uuid)
        return true
    }

    clear() {
        this.#byName.clear()
        this.#byUnique.clear()
        this.#byUUID.clear()
    }
}