import { DIMENSIONS, GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants";
import { recurseUpdate } from "#extra/extraFunctions";
import { isV3, V3 } from "#extra/extraWorldFunctions";
import { BedrockEntity } from "./BedrockEntity.js";

export class BedrockPlayer extends BedrockEntity {
    username = "Steve"
    uuid = ""
    #gamemode = 0
    #dimension = 0
    #permission = 0

    #cameraOrientation = V3(0, 0, 0)

    abilities = {}

    #loaded = false
    get isLoaded() { return this.#loaded }

    create(username, uniqueId, uuid = undefined, runtimeId = undefined) {
        this.username = username
        if (uuid) this.uuid = uuid
        super.create("player", uniqueId, runtimeId)
        
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

    buildFromPacket(playerPacket) {
        const { username, uuid, unique_id, runtime_id, position, yaw, head_yaw, pitch } = playerPacket

        this.create(username, unique_id, uuid, runtime_id)
        this.updateStatesFromPacket(playerPacket)
        this.updateAbilitiesFromPacket(playerPacket)
        this.update(position, yaw, head_yaw, pitch)

        this.permission = playerPacket.permission_level
        this.gamemode = playerPacket.gamemode
        this.device = {
            id: playerPacket.device_id,
            os: playerPacket.device_os,
        }

        return this
    }

    get dimension() { return this.#dimension }
    set dimension(dimension) {
        if (typeof dimension === 'string') dimension = DIMENSIONS[dimension]
        if (typeof dimension !== 'number') throw new TypeError(`Expected number, received ${typeof dimension}`)
        
        this.events.emit("changeDimension", dimension, this.#dimension)
        this.#dimension = dimension
    }

    get permission() { return this.#permission }
    set permission(permission) {
        if (typeof permission === 'string') permission = PERMISSION_LEVELS[permission]
        if (typeof permission !== 'number') throw new TypeError(`Expected number, received ${typeof permission}`)
        
        this.events.emit("changePermission", permission, this.#permission)
        this.#permission = permission
    }

    get gamemode() { return this.#gamemode }
    set gamemode(gamemode) {
        if (typeof gamemode === 'string') gamemode = GAMEMODES[gamemode]
        if (typeof gamemode !== 'number') throw new TypeError(`Expected number, received ${typeof gamemode}`)

        this.events.emit("changeGamemode", gamemode, this.#gamemode)
        this.#gamemode = gamemode
    }

    get camera() { return this.#cameraOrientation }
    set camera(v3) { if (isV3(v3)) Object.assign(this.#cameraOrientation, v3); else throw new TypeError(`Expected V3 Object, received: ${typeof v3}`) }

    setAbilities(abilitiesInput) { recurseUpdate(this.abilities, abilitiesInput) }
    updateAbilitiesFromPacket(playerPacket) {
        const enabled = playerPacket?.abilities?.[0]?.enabled ?? {}
        this.setAbilities(enabled)
    }
}