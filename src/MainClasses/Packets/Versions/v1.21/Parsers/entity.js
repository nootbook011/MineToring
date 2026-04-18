import { BedrockEntity } from "#Base/BedrockWorld/bedrockObjects/BaseBedrockEntity"
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

    static updateEntity(attributes, states, entity) {
        if (attributes) {
            const oldAttributes = entity?.attributes?.object
            
            for (const attribute of attributes) {
                const data = attribute[1]
                entity.attributes.add(attribute[0], { ...data, value: data.current })
            }
            entity.events.emit('attributes', entity.attributes.object, oldAttributes)
        }
        if (states) {
            entity.setStates(states)
            entity.events.emit('states', entity.states)
        }
    }
    
    static buildEntity(p, entities, events, data) {
        const { attributes, states } = data
        const metadata = entityParser.metadata(p)
        
        const BEntity = new BedrockEntity(metadata, states)
        
        BEntity.loadPlugin(entityParser.buildPhysics(BEntity, p, states))
        BEntity.loadPlugin(new BedrockAttributes(BEntity, attributes))
        entities.setEntity(BEntity, metadata.id)
        events.emit('newEntity', BEntity)

        return BEntity
    }
    
    static parseEntity(p, type, entities, events) {
        const runtime = p.runtime_id || p.runtime_entity_id
        let unique = undefined
        if (!runtime) unique = Array.isArray(p.entity_unique_id) ? parseLi64(p.entity_unique_id) : p.entity_unique_id
        const BEntity = entities.getEntity({ runtime, unique })

        const attributes = entityParser.attributes(p)
        const states = entityParser.states(p)
        
        if (!BEntity) {
            switch(type) {
                case 0:
                    return entityParser.buildEntity(p, entities, events, { attributes, states })
                    break
                case 1:
                    return playerParser.buildPlayer(p, entities, events, { attributes, states })
                    break
                case 2:
                    return
                    break
            }
        }
        else {
            entityParser.updatePhysics(BEntity.physics, undefined, states)
            entityParser.updateEntity(attributes, states, BEntity)
            if (type === 1) playerParser.updateAbilities(BEntity, p)
        }
        return BEntity
    }
}