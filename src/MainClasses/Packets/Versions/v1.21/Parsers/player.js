export default class playerParser {
    static metadata(p = {}) {
        return {
            username: p.username,
            uuid: p.uuid,
            id: {
                unique: p.unique_id,
                runtime: p.runtime_id,
                platform_chat: p.platform_chat_id,
            },
            device: {
                id: p.device_id,
                os: p.device_os,
            }
        }
    }
    
    static data(p = {}) {
        return {}
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
        const physics = new BedrockPhysicsManager(flags)
        
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
            const { boundingbox_width = 0, boundingbox_height = 0, scale = 0, hitbox = {} } = states
            physics.collision.boundingbox = { width: boundingbox_width, height: boundingbox_height }
            physics.collision.hitbox = hitbox
            physics.collision.scale = scale
        }

    }

    static updateEntity(states, entity) {
        if (states) {
            entity.setStates(states)
        }
    }
    
    static buildEntity(p, entities) {
        let runtime = p.runtime_id || p.runtime_entity_id
        let BEntity = entities.getEntity({ runtime })

        const states = entityParser.states(p)

        if (!BEntity) {
            const metadata = entityParser.metadata(p)
            if (!metadata.type) return
            
            BEntity = new BedrockPlayer(metadata, states)
            
            BEntity.loadPlugin(entityParser.buildPhysics(BEntity, p, states))
            entities.setEntity(BEntity, metadata.id)

            //console.log(`Entity added: ${metadata.type}, runtime: ${metadata.id.runtime}`)
        }
        else {
            entityParser.updatePhysics(BEntity.physics, undefined, states)
            entityParser.updateEntity(attributes, states, BEntity)
            
            //console.log(`Entity ${BEntity.metadata.type}, runtime: ${BEntity.metadata.id.runtime}, x: ${BEntity.position.x.toFixed(0)}, y: ${BEntity.position.y.toFixed(0)}, z: ${BEntity.position.z.toFixed(0)}, health: ${tester?.toFixed(0)}`)
        }

        return BEntity
    }
}