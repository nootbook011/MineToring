import entityParser from "./entity.js"
import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer"
import { BedrockAttributes } from "../Modules/Attributes.js"
import { parseLi64 } from "#extra/extraFunctions"
import { GAMEMODES } from "#extra/extraConstants"

export default class playerParser {
    static metadata(p = {}) {
        return {
            username: p.username,
            uuid: p.uuid,
            gamemode: typeof p.gamemode === 'string' ? GAMEMODES[p.gamemode] : p.gamemode,
            id: {
                unique: parseLi64(p.unique_id),
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

    static updateAbilities(p, player, entities = undefined) {
        if (!player) player = entities.getEntity({ unique: p.entity_unique_id })
        if (!player) return
        player.setMetadata({
            permission: {
                level: p?.permission_level,
                command: p?.command_permission,
            }
        })
        for (const ability of p?.abilities || []) {
            const { type, ...data } = ability
            player.abilities[type] = data
        }
    }
    
    static buildPlayer(p, entities, events) {
        const states = entityParser.states(p)
        const metadata = playerParser.metadata(p)
        
        const BPlayer = new BedrockPlayer(metadata, states)
        
        playerParser.updateAbilities(p, BPlayer)
        BPlayer.loadPlugin(entityParser.buildPhysics(BPlayer, p, states))
        BPlayer.loadPlugin(new BedrockAttributes(BPlayer))
        entities.setEntity(BPlayer, metadata.id)
        events.emit('newPlayer', BPlayer)

        return BPlayer
    }
}