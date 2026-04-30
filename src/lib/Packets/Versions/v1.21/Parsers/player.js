import entityParser from "./entity.js"
import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer"
import { BedrockAttributes } from "../Modules/Attributes.js"
import { parseLi64, recurseUpdate } from "#extra/extraFunctions"
import { COMMAND_PERMISSION_LEVELS, GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants"
import { BedrockSkin } from "../Modules/Skin.js"

export default class Player {
    static metadata(p = {}) {
        return {
            username: p.username,
            uuid: p.uuid,
            gamemode: typeof p.gamemode === 'string' ? GAMEMODES[p.gamemode] : p.gamemode,
            id: {
                unique: parseLi64(p.unique_id || p.entity_unique_id),
                runtime: p.runtime_id,
                xbox: p.xbox_user_id,
                platformChat: p.platform_chat_id,
            },
            type: {
                host: p.is_host || false,
                subclient: p.is_subclient || false,
                teacher: p.is_teacher || false,
            },
            device: {
                id: p.device_id,
                os: p.device_os,
            },
        }
    }

    static data(p = {}) {
        return {}
    }

    static updateAbilities(p, player, playerList = undefined) {
        player ??= playerList.getPlayer(p.entity_unique_id)
        if (!player) return

        player.setMetadata({
            permission: {
                level: PERMISSION_LEVELS[p?.permission_level],
                command: COMMAND_PERMISSION_LEVELS[p?.command_permission],
            }
        })
        for (const ability of p?.abilities || []) {
            const { type, ...data } = ability
            player.abilities[type] = data
        }
    }
    
    static buildPlayerFromRecord(record, playerList) {
        if (playerList.hasPlayer(record.username)) return

        const metadata = Player.metadata(record)
        const skin = new BedrockSkin()
        Object.assign(skin, record.skin_data)

        const BPlayer = new BedrockPlayer(metadata)
        BPlayer.loadPlugin(skin)

        if (playerList) playerList.setPlayer(BPlayer)

        return BPlayer
    }

    static removePlayerFromRecord(record, playerList) {
        playerList.delPlayer(record.uuid)
    }

    static viewPlayer(p, playerList, entities = undefined, events = undefined) {
        let BPlayer = playerList.getPlayer(p.username)
        if (!BPlayer) {
            BPlayer = Player.buildPlayer(p, entities, events)
            playerList.setPlayer(BPlayer.metadata.username, BPlayer)
            return BPlayer
        }

        const states = entityParser.states(p)
        const metadata = Player.metadata(p)
        recurseUpdate(BPlayer.metadata, metadata, true)
        BPlayer.setStates(states)
        if (!BPlayer.plugins.physics) BPlayer.loadPlugin(entityParser.buildPhysics(BPlayer, p, states))
        if (!BPlayer.plugins.attributes) BPlayer.loadPlugin(new BedrockAttributes(BPlayer))
        if (entities) entities.setEntity(BPlayer)
        if (events) events.emit('newPlayer', BPlayer)

        return BPlayer
    }

    static buildPlayer(p, entities = undefined, events = undefined) {
        const states = entityParser.states(p)
        const metadata = Player.metadata(p)
        
        const BPlayer = new BedrockPlayer(metadata, states)
        
        Player.updateAbilities(p, BPlayer)
        BPlayer.loadPlugin(entityParser.buildPhysics(BPlayer, p, states))
        BPlayer.loadPlugin(new BedrockAttributes(BPlayer))
        if (entities) entities.setEntity(BPlayer)
        if (events) events.emit('newPlayer', BPlayer)

        return BPlayer
    }
}