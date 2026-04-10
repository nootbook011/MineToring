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

    static updatePhysics(physics, p, info) {
        const { boundingbox_width = 0, boundingbox_height = 0, scale = 0, hitbox = {} } = Object.fromEntries(info)
        const { position, velocity, pitch, yaw, head_yaw, body_yaw } = p
        physics.position = position
        physics.setRotation(pitch, { all: yaw, body: body_yaw, head: head_yaw })
        physics.physics.velocity = velocity
        physics.collision.boundingbox = { width: boundingbox_width, height: boundingbox_height }
        physics.collision.hitbox = hitbox
        physics.collision.scale = scale
    }

    static buildPhysics(p, info) {
        let flags = {}
        for (const info of p.metadata) {
            if (info.key.startsWith('flag')) Object.assign(flags, info.value)
        }

        const physics = new BedrockPhysicsManager(Object.entries(flags))
        this.updatePhysics(physics, p, info)
        return physics
    }

    static attributes(p = {}) {
        const { attributes = [] } = p
        return attributes.map(({ name, ...data }) => [name, data])
    }

    static info(p = {}) {
        const { metadata = [] } = p
        return metadata.flatMap(({ key, value }) => {
            if (key.startsWith('flag')) return []
            return [[key, value]]
        })
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
            BEntity = new BedrockEntity(metadata, attributes, physics)
            bedrockMap.setEntity(BEntity, runtime_id)
        } else {
            this.updateEntity(attributes, info, BEntity)
            this.updatePhysics(BEntity.physics, p, info)
        }

        return BEntity
    }
}