import { BedrockPhysicsManager } from "#Storage/BaseBedrockPhysicsManager"
import { BedrockEntity } from "#Base/BedrockWorld/bedrockObjects/BaseBedrockEntity"

export default class entityParser {
    static metadata(p = {}) {
        return {
            type: p.entity_type || 'minecraft:zombie',
            id: {
                unique: p.unique_id || BigInt(0),
                runtime: p.runtime_id || BigInt(0)
            }
        }
    }

    static data(p = {}) {
        return {}
    }
    
    static buildFlags(info) {
        const flags = {}
        for (const key in info) {
            if (key.startsWith('flag')) {
                Object.assign(flags, info[key])
                delete info[key]
            }
        }
        return flags
    }

    static updatePhysics(physics, p, info, updateFlags = true) {
        const { boundingbox_width = 0, boundingbox_height = 0, scale = 0, hitbox = {} } = info
        const { position, velocity, pitch, yaw, head_yaw, body_yaw } = p
        
        if (updateFlags) {
            const flags = entityParser.buildFlags(info)
            Object.assign(physics.flags, flags)
        }
        
        physics.position = position
        physics.setRotation(pitch, { all: yaw, body: body_yaw, head: head_yaw })
        physics.physics.velocity = velocity
        physics.collision.boundingbox = { width: boundingbox_width, height: boundingbox_height }
        physics.collision.hitbox = hitbox
        physics.collision.scale = scale
    }

    static buildPhysics(p, info) {
        const flags = entityParser.buildFlags(info)
        const physics = new BedrockPhysicsManager(flags)
        entityParser.updatePhysics(physics, p, info, false)
        return physics
    }

    static attributes(p = {}) {
        const { attributes = [] } = p
        return attributes.map(({ name, ...data }) => [name, data])
    }

    static info(p = {}) {
        const { metadata = [] } = p
        return Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        }))
    }

    static updateEntity(attributes, info, entity) {
        if (attributes) {
            for (const attribute of attributes) {
                entity.addAttribute(attribute[0], attribute[1])
            }
        }
        if (info) {
            entity.setInfo(info)
        }
    }

    static buildEntity(p, bedrockMap) {
        let runtime_id = p.runtime_id
        runtime_id ??= p.runtime_entity_id

        const metadata = entityParser.metadata(p)
        const attributes = entityParser.attributes(p)
        const info = entityParser.info(p)

        let BEntity = bedrockMap.getEntity(runtime_id)
        if (!BEntity) {
            const physics = entityParser.buildPhysics(p, info)
            BEntity = new BedrockEntity(metadata, info, attributes, physics)
            bedrockMap.setEntity(BEntity, runtime_id)
        } else {
            entityParser.updatePhysics(BEntity.physics, p, info)
            entityParser.updateEntity(attributes, info, BEntity)
        }

        return BEntity
    }
}