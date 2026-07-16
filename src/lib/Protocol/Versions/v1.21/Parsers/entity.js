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
    
    /** @param {BedrockEntity} BEntity  */
    static buildEntity(p, BEntity) {
        const { attributes, entity_type: type, unique_id, runtime_id } = p
        const states = Entity.states(p)
        
        BEntity.create(type, unique_id, runtime_id)
        BEntity.setStates(states)
        Entity.updatePhysics(BEntity, p)
        BEntity.loadPlugin(new BedrockAttributes(BEntity, attributes))

        return BEntity
    }
}