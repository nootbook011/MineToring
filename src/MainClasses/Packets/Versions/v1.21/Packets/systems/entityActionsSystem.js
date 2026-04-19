import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import entityParser from "../../Parsers/entity.js";
import playerParser from "../../Parsers/player.js";

export default class EntityActions extends BaseModule {
    get botDimension() { 
        const dim = this.bot.world.getDimension(this.bot.player.dimension)
        if (!dim) console.log(0)
        return dim
    }
    
    entityActionsLoop() {
        const packets = this.bot.packets
        const actions = {
            'remove_entity': this.removeEntity.bind(this),
            'move_entity_delta': this.moveEntity.bind(this),
            'move_player': this.movePlayer.bind(this),
            'set_entity_data': (p) => { entityParser.updateStates(p, this.botDimension.entities) },
            'update_attributes': (p) => { entityParser.updateAttributes(p, this.botDimension.entities) },
            'update_abilities': (p) => { playerParser.updateAbilities(p, undefined, this.botDimension.entities) },
        }
        
        for (const action in actions) {
            packets.on(action, (p) => actions[action](p) )
        }
    }
    
    movePlayer(p) {
        const entities = this.botDimension.entities
        const runtime = p.runtime_id
        const player = entities.getEntity({ runtime })
        if (!player) return

        player.position.x = p.position.x
        player.position.y = p.position.y
        player.position.z = p.position.z

        const toDeg = (val) => val * (360 / 256)

        player.rotation.pitch = toDeg(p.pitch)
        player.rotation.yaw.body = toDeg(p.yaw)
        player.rotation.yaw.all = toDeg(p.yaw)
        player.rotation.yaw.head = toDeg(p.head_yaw)

        player.events.emit('move', player.position, player.rotation )
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