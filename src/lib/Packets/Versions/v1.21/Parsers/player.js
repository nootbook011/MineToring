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

    static updateAbilities(p, player, playerList = undefined) {
        player ??= playerList.getPlayer(p.entity_unique_id)
        if (!player) return

        player.setMetadata({
            permission: {
                level: PERMISSION_LEVELS[p?.permission_level ?? 0],
                command: COMMAND_PERMISSION_LEVELS[p?.command_permission ?? 0],
            }
        })
        for (const ability of p?.abilities || []) {
            const { type, ...data } = ability
            player.abilities[type] = data
        }
    }
    
    static buildPlayerFromRecord(record) {
        const metadata = Player.metadata(record)
        const skin = new BedrockSkin()
        Object.assign(skin, record.skin_data)

        const BPlayer = new BedrockPlayer(metadata)
        BPlayer.loadPlugin(skin)

        return BPlayer
    }

    static viewPlayer(p, playerList) {
        /** @type {BedrockPlayer} */
        let BPlayer = playerList.getPlayer(p.unique_id)
        if (!BPlayer) {
            BPlayer = Player.buildPlayer(p)
            playerList.setPlayer(BPlayer)
            return BPlayer
        }

        const states = entityParser.states(p)
        const metadata = Player.metadata(p)
        recurseUpdate(BPlayer.metadata, metadata, true)

        BPlayer.setStates(states)
        Player.updateAbilities(p, BPlayer)
        entityParser.updatePhysics(BPlayer, p, states)
        if (!BPlayer.pluginsList.includes('attributes')) BPlayer.loadPlugin(new BedrockAttributes(BPlayer))

        return BPlayer
    }

    static buildPlayer(p) {
        const states = entityParser.states(p)
        const metadata = Player.metadata(p)
        
        const BPlayer = new BedrockPlayer(metadata, states)
        
        Player.updateAbilities(p, BPlayer)
        entityParser.updatePhysics(BPlayer, p, states)
        BPlayer.loadPlugin(new BedrockAttributes(BPlayer))

        return BPlayer
    }
}