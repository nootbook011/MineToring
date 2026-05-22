import { BedrockEntity } from "#World/bedrockObjects/BaseBedrockEntity"
import { DIMENSIONS } from "#extra/extraConstants"

import { BedrockAttributes } from "../Modules/Attributes.js"
import playerParser from "./player.js"

export default class Entity {
    static states(p = {}) {
        const { metadata } = p
        if (!metadata) return {}
        return Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        }))
    }

    /** @param {BedrockEntity} entity */
    static updatePhysics(entity, p) {
        if (p) {
            const { position, pitch, yaw, head_yaw } = p

            entity.position = position
            entity.yaw = yaw
            entity.headYaw = head_yaw
            entity.pitch = pitch
        }
    }

    static buildPlayerFromStartgame(startgame, bot) {
        const { player_gamemode, player_position, rotation, dimension } = startgame
        const playerFromList = bot.server.getPlayer(bot.username)
        // p.enchantment_seed
        const packet = {
            username: bot.username,
            uuid: playerFromList ? playerFromList.uuid : bot.session.uuid,
            gamemode: player_gamemode,
            unique_id: startgame.entity_id,
            runtime_id: startgame.runtime_entity_id,
            device_id: bot.session.devid,
            device_os: 'win10',
            position: player_position,
            pitch: rotation.x,
            yaw: rotation.z,
            head_yaw: rotation.z,
            body_yaw: rotation.z,
            command_permission: startgame.permission_level
        }
        const player = bot.world.addEntity(packet, 1, bot.server.playerList)
        player.dimension = DIMENSIONS[dimension]
        return player
    }
    
    static buildEntity(p) {
        const { attributes, entity_type: type, unique_id, runtime_id } = p
        const states = Entity.states(p)
        
        const BEntity = new BedrockEntity()
        BEntity.create(type, unique_id, runtime_id)
        BEntity.setStates(states)
        Entity.updatePhysics(BEntity, p)
        BEntity.loadPlugin(new BedrockAttributes(BEntity, attributes))

        return BEntity
    }
}