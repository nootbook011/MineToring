import { DIMENSIONS, GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants";
import { recurseUpdate } from "#extra/extraFunctions";
import { BedrockEntity } from "./BaseBedrockEntity.js";

export class BedrockPlayer extends BedrockEntity {
    #username = "steve"
    #uuid = ""
    #gamemode = 0
    #dimension = 0
    #permission = 0

    #abilities = {}

    create(username, uniqueId, uuid = undefined, runtimeId = undefined) {
        this.#username = username
        if (uuid) this.#uuid = uuid
        super.create("player", uniqueId, runtimeId)
    }

    get username() { return this.#username }
    get uuid() { return this.#uuid }

    get dimension() { return this.#dimension }
    set dimension(dimension) {
        if (typeof dimension === 'string') dimension = DIMENSIONS[dimension]
        else throw new TypeError(`Dimension only can be number, received ${typeof dimension}`)
        this.events.emit("changeDimension", dimension, this.#dimension)
        this.#dimension = dimension
    }

    get permission() { return this.#permission }
    set permission(permission) {
        if (typeof permission === 'string') permission = PERMISSION_LEVELS[permission]
        else throw new TypeError(`Permission only can be number, received ${typeof permission}`)
        this.events.emit("changePermission", permission, this.#permission)
        this.#permission = permission
    }

    get gamemode() { return this.#gamemode }
    set gamemode(gamemode) {
        if (typeof gamemode === 'string') gamemode = GAMEMODES[gamemode]
        else throw new TypeError(`GameMode only can be number, received ${typeof gamemode}`)
        this.events.emit("changeGamemode", gamemode, this.#gamemode)
        this.#gamemode = gamemode
    }

    get abilities() { return this.#abilities }
    setAbilities(abilitiesInput) { recurseUpdate(this.#abilities, abilitiesInput) }
}