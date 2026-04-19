import { BedrockEntity } from "#Base/BedrockWorld/bedrockObjects/BaseBedrockEntity"
import { DIMENSIONS } from "#extra/extraConstants"
import { parseLi64 } from "#extra/extraFunctions"

import { BedrockAttributes } from "../Modules/Attributes.js"
import { BedrockPhysicsManager } from "../Modules/PhysicsManager.js"
import playerParser from "./player.js"

export default class entityParser {
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

    static attributes(p = {}) {
        const { attributes } = p
        if (!attributes) return
        return attributes.map(({ name, ...data }) => [name, data])
    }

    static states(p = {}) {
        const { metadata } = p
        if (!metadata) return
        return Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        }))
    }

    static buildFlags(states) {
        if (!states) return
        const flags = {}
        for (const key in states) {
            if (key.startsWith('flag')) {
                Object.assign(flags, states[key])
            }
        }
        return flags
    }

    static buildPhysics(entity, p, states) {
        const flags = entityParser.buildFlags(states)
        const physics = new BedrockPhysicsManager(entity, flags)
        
        entityParser.updatePhysics(physics, p, states, false)
        
        return physics
    }
    static updatePhysics(physics, p, states, updateFlags = true) {

        if (updateFlags) {
            const flags = entityParser.buildFlags(states)
            Object.assign(physics.flags, flags)
        }

        if (p) {
            const { position, velocity, pitch, yaw, head_yaw, body_yaw } = p

            physics.position = position
            physics.setRotation(pitch, { all: yaw, body: body_yaw, head: head_yaw })
            physics.physics.velocity = velocity
        }

        if (states) {
            const { boundingbox_width, boundingbox_height, scale, hitbox } = states
            if (boundingbox_width) physics.collision.boundingbox.width = boundingbox_width
            if (boundingbox_height) physics.collision.boundingbox.height = boundingbox_height
            if (hitbox) physics.collision.hitbox = hitbox
            if (scale) physics.collision.scale = scale
        }

    }

    static updateAttributes(p, entities) {
        const entity = entities.getEntity({ runtime: p.runtime_entity_id })
        if (!entity) return
        const attributes = entityParser.attributes(p)
        const oldAttributes = entity?.attributes?.object
        
        for (const attribute of attributes) {
            const data = attribute[1]
            entity.attributes.set(attribute[0], { ...data, value: data.current })
        }

        entity.events.emit('attributes', entity.attributes.object, oldAttributes)
    }

    static updateStates(p, entities) {
        const entity = entities.getEntity({ runtime: p.runtime_entity_id })
        if (!entity) return
        const states = entityParser.states(p)
        entity.setStates(states)
        entityParser.updatePhysics(entity.physics, undefined, states)
        entity.events.emit('states', entity.states)
    }

    static buildPlayerFromStartgame(startgame, bot) {
        const { player_gamemode, player_position, rotation, dimension } = startgame
        const packet = {
            username: bot.options.client.username,
            uuid: bot.session.uuid,
            gamemode: player_gamemode,
            unique_id: startgame.entity_id,
            runtime_id: startgame.runtime_entity_id,
            device_id: bot.session.devid,
            device_os: 'win10',
            position: player_position,
            pitch: rotation.x,
            yaw: rotation.z,
            head_yaw: rotation.z,
            body_yaw: rotation.z
        }
        const playerDimension = bot.world.getDimension(DIMENSIONS[dimension])
        const player = playerDimension.addEntity(packet, 1)
        player.dimension = DIMENSIONS[dimension]
        return player
    }
    
    static buildEntity(p, entities, events) {
        const attributes = entityParser.attributes(p)
        const states = entityParser.states(p)
        const metadata = entityParser.metadata(p)
        
        const BEntity = new BedrockEntity(metadata, states)
        
        BEntity.loadPlugin(entityParser.buildPhysics(BEntity, p, states))
        BEntity.loadPlugin(new BedrockAttributes(BEntity, attributes))
        entities.setEntity(BEntity, metadata.id)
        events.emit('newEntity', BEntity)

        return BEntity
    }
    
    static parseEntity(p, type, entities, events) {
        const BEntity = entities.getEntity({ runtime: p.runtime_id, unique: p.unique_id })
        if (BEntity) return

        switch(type) {
            case 0:
                return entityParser.buildEntity(p, entities, events)
            break
            case 1:
                return playerParser.buildPlayer(p, entities, events)
            break
            case 2:
                return
            break
        }
    }
}