import { BaseModule } from "#Base/BedrockStorage/moduleBase";

export default class EntityActions extends BaseModule {
    get botDimension() { return this.bot.world.getDimension(0) }
    
    entityActionsLoop() {
        const packets = this.bot.packets
        const actions = {
            'remove_entity': this.removeEntity.bind(this),
            'move_entity_delta': this.moveEntity.bind(this),
        }
        
        for (const action in actions) {
            packets.on(action, (p) => actions[action](p) )
        }
    }
    
    moveEntity(p) {
        const entities = this.botDimension.entities
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

        entity.events.emit('move', entity.position, entity.rotation, p.flags )
    }
    
    removeEntity(p) {
        const { entity_id_self: unique } = p
        const entity = this.botDimension.entities.getEntity({ unique })
        if (!entity) return
        this.botDimension.entities.delEntity(entity.metadata.id)
        entity.events.emit('despawn')
    }
    
}