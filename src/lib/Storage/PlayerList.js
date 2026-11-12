import { BedrockPlayer } from "#Core/World/BedrockPlayer"
import { getStringFromBigInt as getKey } from "#extra/extraFunctions"

export class PlayerList {
    /** @type {Map<string, import('#World/Objects/BedrockPlayer').BedrockPlayer>} */
    #byName = new Map()
    /** @type {Map<string, import('#World/Objects/BedrockPlayer').BedrockPlayer>} */
    #byUUID = new Map()
    /** @type {Map<string, import('#World/Objects/BedrockPlayer').BedrockPlayer>} */
    #byUnique = new Map()

    get size() { return this.#byName.size }
    get values() { return this.#byName.values() }
    get usernames() { return this.#byName.keys() }
    get uniqueIds() { return this.#byUnique.keys() }
    get uuids() { return this.#byUUID.keys() }

    addPlayer(player) {
        if (!(player instanceof BedrockPlayer)) throw new TypeError(`Expected BedrockPlayer class, received: ${typeof player}`)
        
        const { username, uuid, uniqueId } = player
        this.#byName.set(username, player)
        if (uniqueId) this.#byUnique.set(getKey(uniqueId), player)
        if (uuid) this.#byUUID.set(uuid, player)
    }

    getPlayerByUsername(name) {
        return this.#byName.get(name)
    }
    getPlayerByUniqueId(uniqueId) {
        return this.#byUnique.get(getKey(uniqueId))
    }
    getPlayerByUUID(uuid) {
        return this.#byUUID.get(uuid)
    }
    getPlayer(id) {
        return this.getPlayerByUniqueId(id) ?? this.getPlayerByUUID(id) ?? this.getPlayerByUsername(id)
    }

    hasPlayerByUsername(name) {
        return this.#byName.has(name)
    }
    hasPlayerByUniqueId(uniqueId) {
        return this.#byUnique.has(getKey(uniqueId))
    }
    hasPlayerByUUID(uuid) {
        return this.#byUUID.has(uuid)
    }
    hasPlayer(id) {
        return this.hasPlayerByUniqueId(id) ?? this.hasPlayerByUUID(id) ?? this.hasPlayerByUsername(id) ?? false
    }

    delPlayer(player) {
        if (!(player instanceof BedrockPlayer)) throw new TypeError(`Expected BedrockPlayer class, received: ${typeof player}`)

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