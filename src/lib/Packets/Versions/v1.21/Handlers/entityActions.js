import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import entityParser from "../Parsers/entity.js";
import playerParser from "../Parsers/player.js";

export class EntityActionsHandler extends BaseModule {
    startEntityActions() {
        const packets = this.bot.packets
        const actions = {
            'remove_entity': this.removeEntity.bind(this),
            'move_entity_delta': this.moveEntity.bind(this),
            'move_player': this.movePlayer.bind(this),
            'change_dimension': this.playerChangeDimension.bind(this),
            'set_entity_data': (p) => { entityParser.updateStates(p, this.bot.world.entities) },
            'update_attributes': this.updateAttributes.bind(this),
            'update_abilities': (p) => { playerParser.updateAbilities(p, undefined, this.bot.world.entities) },
            'respawn': (p) => { this.bot.player.position = p.position },
            'set_health': (p) => { this.bot.player.attributes.health = p.health },
        }
        
        for (const action in actions) {
            packets.on(action, (p) => actions[action](p) )
        }
    }

    updateAttributes(p) {
        const entity = entityParser.updateAttributes(p, this.bot.world.entities)
        if (!entity) return
        
        if (entity.attributes.health <= 0) {
            entity.events.emit('death')
        }
    }

    playerChangeDimension(p) {
        this.bot.player.dimension = p.dimension
        this.bot.player.position = p.position
        this.bot.player.events.emit('changeDimesion', p.dimension)
    }
    
    movePlayer(p) {
        const entities = this.bot.world.entities
        const runtime = p.runtime_id
        const player = entities.getEntity({ runtime })
        if (!player) return

        player.position = p.position
        player.physics.setRotation(p.pitch, { all: p.yaw, body: p.yaw, head: p.head_yaw })

        player.events.emit('move', player.position, player.rotation )
    }

    moveEntity(p) {
        const entities = this.bot.world.entities
        const runtime = p.runtime_entity_id
        const entity = entities.getEntity({ runtime })
        if (!entity) return

        if (p.flags.has_x) entity.position.x = p.x
        if (p.flags.has_y) entity.position.y = p.y
        if (p.flags.has_z) entity.position.z = p.z

        if (p.flags.has_rot_x) {
            entity.rotation.pitch = p.rot_x
        }

        if (p.flags.has_rot_y) {
            entity.rotation.yaw.body = p.rot_y
            entity.rotation.yaw.all = p.rot_y
        }

        if (p.flags.has_rot_z) {
            entity.rotation.yaw.head = p.rot_z

            if (!p.flags.has_rot_y) {
                entity.rotation.yaw.all = p.rot_z
            }
        }

        entity.events.emit('move', entity.position, entity.rotation, p.flags )
    }
    
    removeEntity(p) {
        const { entity_id_self: unique } = p
        const entity = this.bot.world.entities.getEntity({ unique })
        if (!entity) return
        this.bot.world.entities.delEntity(entity.metadata.id)
        entity.events.emit('despawn')
    }
    
}