import { BedrockAttributes } from "#World/Modules/Attributes";
import { DIMENSIONS, GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants";
import { recurseUpdate } from "#extra/extraFunctions";
import { BedrockEntity } from "./BaseBedrockEntity.js";

export class BedrockPlayer extends BedrockEntity {
    #username = "Steve"
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

    buildFromPacket(playerPacket) {
        const { username, uuid, unique_id, runtime_id, position, yaw, head_yaw, pitch } = playerPacket

        this.create(username, unique_id, uuid, runtime_id)
        this.updateStatesFromPacket(playerPacket)
        this.updateAbilitiesFromPacket(playerPacket)
        this.updatePhysics(position, yaw, head_yaw, pitch)

        this.permission = playerPacket.permission_level
        this.gamemode = playerPacket.gamemode
        this.device = {
            id: playerPacket.device_id,
            os: playerPacket.device_os,
        }

        return this
    }

    get username() { return this.#username }
    get uuid() { return this.#uuid }

    get dimension() { return this.#dimension }
    set dimension(dimension) {
        if (typeof dimension === 'string') dimension = DIMENSIONS[dimension]
        else if (typeof dimension !== 'number') throw new TypeError(`Dimension only can be number, received ${typeof dimension}`)

        this.events.emit("changeDimension", dimension, this.#dimension)
        this.#dimension = dimension
    }

    get permission() { return this.#permission }
    set permission(permission) {
        if (typeof permission === 'string') permission = PERMISSION_LEVELS[permission]
        else if (typeof permission !== 'number') throw new TypeError(`Permission only can be number, received ${typeof permission}`)

        this.events.emit("changePermission", permission, this.#permission)
        this.#permission = permission
    }

    get gamemode() { return this.#gamemode }
    set gamemode(gamemode) {
        if (typeof gamemode === 'string') gamemode = GAMEMODES[gamemode]
        else if (typeof gamemode !== 'number') throw new TypeError(`GameMode only can be number, received ${typeof gamemode}`)

        this.events.emit("changeGamemode", gamemode, this.#gamemode)
        this.#gamemode = gamemode
    }

    get abilities() { return this.#abilities }
    setAbilities(abilitiesInput) { recurseUpdate(this.#abilities, abilitiesInput) }
    updateAbilitiesFromPacket(playerPacket) {
        const enabled = playerPacket?.abilities?.[0]?.enabled ?? {}
        this.setAbilities(enabled)
    }
}