import { BedrockEntity } from "#World/bedrockObjects/BaseBedrockEntity"
import { DIMENSIONS } from "#extra/extraConstants"

import { BedrockAttributes } from "../Modules/Attributes.js"
import playerParser from "./player.js"

export default class Entity {
    static metadata(p = {}) {
        return {
            type: p.entity_type,
            id: {
                unique: p.unique_id,
                runtime: p.runtime_id
            }
        }
    }

    static data(p = {}) {
        return {}
    }

    static states(p = {}) {
        const { metadata } = p
        if (!metadata) return {}
        return Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        }))
    }

    /** @param {BedrockEntity} entity */
    static updatePhysics(entity, p = undefined, states = undefined) {
        if (p) {
            const { position, velocity, pitch, yaw, head_yaw, body_yaw } = p

            entity.position = position
            entity.setRotation(pitch, { all: yaw, body: body_yaw, head: head_yaw })
            entity.velocity = velocity
        }

        if (states) {
            const { boundingbox_width, boundingbox_height, scale, hitbox } = states

            if (boundingbox_width) entity.collision.boundingbox.width = boundingbox_width
            if (boundingbox_height) entity.collision.boundingbox.height = boundingbox_height
            if (hitbox) entity.collision.hitbox = hitbox
            if (scale) entity.collision.scale = scale
        }

    }

    static buildPlayerFromStartgame(startgame, bot) {
        const { player_gamemode, player_position, rotation, dimension } = startgame
        const playerFromList = bot.server.getPlayer(bot.username)
        const packet = {
            username: bot.username,
            uuid: playerFromList ? playerFromList.metadata.uuid : bot.session.uuid,
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
        const player = playerParser.viewPlayer(packet, bot.server.playerList, bot.world.entities)
        player.dimension = DIMENSIONS[dimension]
        return player
    }
    
    static buildEntity(p) {
        const { attributes } = p
        const states = Entity.states(p)
        const metadata = Entity.metadata(p)
        
        const BEntity = new BedrockEntity(metadata, states)
        BEntity.loadPlugin(new BedrockAttributes(BEntity, attributes))

        return BEntity
    }
}