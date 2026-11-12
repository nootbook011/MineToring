import { GAMEMODES, PERMISSION_LEVELS } from "#Storage/constants";
import { recurseUpdate } from "#extra/extraFunctions";
import { isV3, updateV3, V3 } from "#extra/extraWorldFunctions";
import { BedrockEntity } from "./BedrockEntity.js";

export class BedrockPlayer extends BedrockEntity {
    username = "Steve"
    uuid = ""
    #gamemode = 0
    #permission = 0

    #cameraOrientation = V3(0, 0, 0)

    abilities = {}

    #loaded = false
    get isLoaded() { return this.#loaded }

    create(username, uniqueId, uuid, runtimeId) {
        super.create("player", uniqueId, runtimeId)
        if (username) this.username = username
        if (uuid) this.uuid = uuid
        if (!this.isLoaded) this.#loaded = true

        return this
    }

    despawn() {
        this.#loaded = false
        this.events.emit('despawn')
    }
    leave() {
        this.#loaded = false
        this.events.emit('leave')
        super.despawn()
    }

    get permission() { return this.#permission }
    set permission(permission) {
        if (typeof permission === 'string') permission = PERMISSION_LEVELS[permission]
        if (typeof permission !== 'number') throw new TypeError(`Expected number, received ${typeof permission}`)
        
        this.#permission = permission
        this.events.emit("changePermission", permission, this.#permission)
    }

    get gamemode() { return this.#gamemode }
    set gamemode(gamemode) {
        if (typeof gamemode === 'string') gamemode = GAMEMODES[gamemode]
        if (typeof gamemode !== 'number') throw new TypeError(`Expected number, received ${typeof gamemode}`)

        this.#gamemode = gamemode
        this.events.emit("changeGamemode", gamemode, this.#gamemode)
    }

    get camera() { return this.#cameraOrientation }
    set camera(v3) {
        if (isV3(v3)) {
            this.#cameraOrientation.x = v3.x
            this.#cameraOrientation.y = v3.y
            this.#cameraOrientation.z = v3.z
        }
        else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`)
    }

    setAbilities(abilitiesInput) {
        const changed = recurseUpdate(this.abilities, abilitiesInput)
        if (changed) this.events.emit('updateAbilities', abilitiesInput)
        return changed
    }
}