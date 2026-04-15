import { BedrockPhysicsManager } from "#Storage/BaseBedrockPhysicsManager"
import { BedrockEntity } from "#Base/BedrockWorld/bedrockObjects/BaseBedrockEntity"

import { BedrockAttributes } from "../Modules/Attributes.js"

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

    static info(p = {}) {
        const { metadata } = p
        if (!metadata) return
        return Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        }))
    }

    static buildFlags(info) {
        if (!info) return
        const flags = {}
        for (const key in info) {
            if (key.startsWith('flag')) {
                Object.assign(flags, info[key])
                delete info[key]
            }
        }
        return flags
    }

    static buildPhysics(p, info) {
        const flags = entityParser.buildFlags(info)
        const physics = new BedrockPhysicsManager(flags)
        entityParser.updatePhysics(physics, p, info, false)
        return physics
    }
    static updatePhysics(physics, p, info, updateFlags = true) {

        if (updateFlags) {
            const flags = entityParser.buildFlags(info)
            Object.assign(physics.flags, flags)
        }

        if (p) {
            const { position, velocity, pitch, yaw, head_yaw, body_yaw } = p

            physics.position = position
            physics.setRotation(pitch, { all: yaw, body: body_yaw, head: head_yaw })
            physics.physics.velocity = velocity
        }

        if (info) {
            const { boundingbox_width = 0, boundingbox_height = 0, scale = 0, hitbox = {} } = info
            physics.collision.boundingbox = { width: boundingbox_width, height: boundingbox_height }
            physics.collision.hitbox = hitbox
            physics.collision.scale = scale
        }

    }

    static updateEntity(attributes, info, entity) {
        if (attributes) {
            for (const attribute of attributes) {
                const data = attribute[1]
                entity.addAttribute(attribute[0], { ...data, value: data.current })
            }
        }
        if (info) {
            entity.setInfo(info)
        }
    }

    static moveEntity(p, entities) {
        const runtime = p.runtime_entity_id
        const entity = entities.getEntity({ runtime })
        if (!entity) return

        if (p.flags.has_x) entity.position.x = p.x
        if (p.flags.has_y) entity.position.y = p.y
        if (p.flags.has_z) entity.position.z = p.z

        const toDeg = (val) => val * (360 / 256)

        if (p.flags.has_rot_x) {
            entity.rotation.pitch = toDeg(p.rot_x);
        }

        if (p.flags.has_rot_y) {
            entity.rotation.yaw.body = toDeg(p.rot_y);
            entity.rotation.yaw.all = toDeg(p.rot_y);
        }

        if (p.flags.has_rot_z) {
            entity.rotation.yaw.head = toDeg(p.rot_z);

            if (!p.flags.has_rot_y) {
                entity.rotation.yaw.all = toDeg(p.rot_z);
            }
        }
    }

    static removeEntity(p, entities) {
        const { entity_id_self: unique } = p
        const entity = entities.getEntity({ unique })
        if (!entity) return
        entities.delEntity(entity.metadata.id)

        //console.log(`Entity removed ${entity.metadata.type}, runtimeId: ${entity.metadata.id.runtime}`)
    }

    static buildEntity(p, entities) {
        let runtime = p.runtime_id || p.runtime_entity_id
        let BEntity = entities.getEntity({ runtime })

        const attributes = entityParser.attributes(p)
        const info = entityParser.info(p)

        if (!BEntity) {
            const metadata = entityParser.metadata(p)
            if (!metadata.type) return

            const physics = entityParser.buildPhysics(p, info)
            BEntity = new BedrockEntity(metadata, info, physics)
            BEntity.loadPlugin(new BedrockAttributes(BEntity, attributes))
            entities.setEntity(BEntity, metadata.id)

            //console.log(`Entity added: ${metadata.type}, runtime: ${metadata.id.runtime}`)
        }
        else {
            entityParser.updatePhysics(BEntity.physics, undefined, info)
            entityParser.updateEntity(attributes, info, BEntity)
            
            //console.log(`Entity ${BEntity.metadata.type}, runtime: ${BEntity.metadata.id.runtime}, x: ${BEntity.position.x.toFixed(0)}, y: ${BEntity.position.y.toFixed(0)}, z: ${BEntity.position.z.toFixed(0)}, health: ${tester?.toFixed(0)}`)
        }

        return BEntity
    }

    static actionEntity(name, p, entities) {
        switch (name) {
            case 'remove_entity': {
                entityParser.removeEntity(p, entities)
            }
            break
            case 'move_entity_delta': {
                entityParser.moveEntity(p, entities)
            }
            break
        }
    }
}