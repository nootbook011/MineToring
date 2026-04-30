import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import { GAMEMODES } from "#extra/extraConstants";
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
            'update_abilities': (p) => { playerParser.updateAbilities(p, undefined, this.bot.server.playerList) },
            'respawn': (p) => { this.bot.player.position = p.position },
            'set_health': (p) => { this.bot.player.health = p.health },
            'update_player_game_type': this.updateGamemode.bind(this),
        }
        
        for (const action in actions) {
            packets.on(action, (p) => actions[action](p) )
        }
    }

    updateGamemode(p) {
        const player = this.bot.server.playerList.getPlayer(p.player_unique_id)
        if (!player) return

        player.setMetadata({ gamemode: GAMEMODES[p.gamemode] })
        player.events.emit('changeGamemode', player.metadata.gamemode)
    }

    updateAttributes(p) {
        const entity = entityParser.updateAttributes(p, this.bot.world.entities)
        if (!entity) return
        
        if (entity.health <= 0) {
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
        const player = entities.getEntity(p.runtime_id)
        if (!player) return

        player.position = p.position
        player.physics.setRotation(p.pitch, { all: p.yaw, body: p.yaw, head: p.head_yaw })

        player.events.emit('move', player.position, player.rotation )
    }

    moveEntity(p) {
        const entities = this.bot.world.entities
        const entity = entities.getEntity(p.runtime_entity_id)
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
        const entity = this.bot.world.entities.getEntity(p.entity_id_self)
        if (!entity) return

        this.bot.world.entities.delEntity(p.entity_id_self)
        entity.events.emit('despawn')
    }
    
}