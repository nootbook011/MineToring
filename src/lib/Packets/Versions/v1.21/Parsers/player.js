import entityParser from "./entity.js"
import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer"
import { BedrockAttributes } from "../Modules/Attributes.js"
import { parseLi64, recurseUpdate } from "#extra/extraFunctions"
import { COMMAND_PERMISSION_LEVELS, GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants"
import { BedrockSkin } from "../Modules/Skin.js"

export default class Player {
    // TODO: Abilities module like attributes
    static updateAbilities(p, player, playerList = undefined) {
        player ??= playerList.getPlayer(p.entity_unique_id)
        if (!player) return

        player.permission = p.permission_level

        for (const ability of p?.abilities || []) {
            const { type, ...data } = ability
            player.abilities[type] = data
        }
    }

    static buildPlayerFromRecord(record) {
        const { username, uuid, entity_unique_id, skin_data }
        const BPlayer = new BedrockPlayer()

        BPlayer.create(username, entity_unique_id, uuid)
        BPlayer.xuid = p.xbox_user_id
        BPlayer.platformChatId = p.platform_chat_id
        BPlayer.role = {
            host: p.is_host,
            subclient: p.is_subclient,
            teacher: p.is_teacher,
        }

        BPlayer.loadPlugin(new BedrockSkin(skin_data))

        return BPlayer
    }

    static viewPlayer(p, playerList) {
        let BPlayer = playerList.getPlayer(p.unique_id)
        return Player.buildPlayer(p, BPlayer)
    }

    static buildPlayer(p, BPlayer) {
        const { username, uuid, gamemode, unique_id, runtime_id, device_id, device_os }
        const states = entityParser.states(p)
        if (!BPlayer) BPlayer = new BedrockPlayer()

        BPlayer.create(username, unique_id, uuid, runtime_id)
        BPlayer.setStates(states)
        BPlayer.gamemode = gamemode
        BPlayer.device = {
            id: device_id,
            os: device_os,
        }

        Player.updateAbilities(p, BPlayer)
        entityParser.updatePhysics(BPlayer, p)
        if (!BPlayer.pluginsList.includes('attributes')) BPlayer.loadPlugin(new BedrockAttributes(BPlayer))

        return BPlayer
    }
}