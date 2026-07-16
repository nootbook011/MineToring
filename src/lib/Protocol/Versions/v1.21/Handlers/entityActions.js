import { BaseModule } from "#Storage/moduleBase";
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
            'set_entity_data': this.updateStates.bind(this),
            'update_attributes': this.updateAttributes.bind(this),
            'update_abilities': (p) => { playerParser.updateAbilities(p, undefined, this.bot.server.playerList) },
            'respawn': (p) => { this.bot.player.position = p.position },
            'set_health': (p) => { this.bot.player.health = p.health },
            'update_player_game_type': this.updateGamemode.bind(this),
            'set_player_game_type': (p) => { this.updateGamemode(p, true) },
        }
        
        for (const action in actions) {
            packets.on(action, (p) => actions[action](p) )
        }
    }
    
    updateStates(p, entities) {
        const entity = this.bot.world.getEntity(p.runtime_entity_id)
        if (!entity) return

        const states = entityParser.states(p)
        entity.setStates(states)

        entity.events.emit('states', entity.states)
    }

    updateGamemode(p, local = false) {
        const player = local ? this.bot.player : this.bot.server.playerList.getPlayer(p.player_unique_id)
        if (!player) return

        player.gamemode = p.gamemode
    }

    updateAttributes(p) {
        const entity = this.bot.world.getEntity(p.runtime_entity_id)
        if (!entity) return

        entity.attributes.update(p?.attributes)
        
        if (entity.health <= 0) {
            entity.events.emit('death')
        }
    }

    playerChangeDimension(p) {
        this.bot.player.dimension = p.dimension
        this.bot.player.position = p.position
    }
    
    movePlayer(p) {
        const player = this.bot.world.getEntity(p.runtime_id)
        if (!player) return

        entityParser.updatePhysics(player, p)
        player.events.emit('move', player)
    }

    moveEntity(p) {
        const entity = this.bot.world.getEntity(p.runtime_entity_id)
        if (!entity) return
        const { x, y, z, rot_x, rot_y, rot_z } = p

        if (x) entity.position.x = x
        if (y) entity.position.y = y
        if (z) entity.position.z = z
        if (rot_x) entity.rotation.x = rot_x
        if (rot_y) entity.rotation.y = rot_y
        if (rot_z) entity.rotation.z = rot_z

        entity.events.emit('move', entity )
    }
    
    removeEntity(p) {
        const entities = this.bot.world.entities
        const entity = entities.getEntity(p.entity_id_self)
        if (!entity) return

        entities.delEntity(p.entity_id_self)
        entity.events.emit('despawn')
    }
    
}