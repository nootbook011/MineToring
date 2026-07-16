import entityParser from "./entity.js"
import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer"
import { BedrockAttributes } from "../Modules/Attributes.js"
import { parseLi64, recurseUpdate } from "#extra/extraFunctions"
import { GAMEMODES, PERMISSION_LEVELS } from "#extra/extraConstants"
import { BedrockSkin } from "../Modules/Skin.js"

export default class Player {
    // TODO: Abilities module, like attributes or gamerules.
    static updateAbilities(p, player, playerList = undefined) {
        player ??= playerList.getPlayer(p.entity_unique_id)
        if (!player) return

        player.permission = p.permission_level

        for (const ability of p?.abilities || []) {
            const { type, ...data } = ability
            player.abilities[type] = data
        }
    }


    static buildPlayerFromStartgame(startgame, bot) {
        const { player_gamemode, player_position, permission_level, rotation, dimension, enchantment_seed } = startgame
        /** @type {BedrockPlayer} */
        let BPlayer = bot.server.getPlayer(bot.username)
        BPlayer ??= new BedrockPlayer(bot.protocol, bot.registry)

        BPlayer.create(
            bot.username,
            startgame.entity_id,
            BPlayer.uuid ? BPlayer.uuid : bot.session.uuid,
            startgame.runtime_entity_id
        )
        BPlayer.position = player_position
        BPlayer.rotation = rotation
        BPlayer.gamemode = player_gamemode
        BPlayer.dimension = dimension
        BPlayer.permission = permission_level
        BPlayer.enchantmentSeed = enchantment_seed

        BPlayer.loadPlugin(new BedrockAttributes(BPlayer))

        bot.world.entities.setEntity(BPlayer)
        return BPlayer
    }

    static buildPlayerFromRecord(record, BPlayer) {
        const { username, uuid, entity_unique_id, skin_data } = record

        BPlayer.create(username, entity_unique_id, uuid)
        BPlayer.xuid = record.xbox_user_id
        BPlayer.platformChatId = record.platform_chat_id
        BPlayer.role = {
            host: record.is_host,
            subclient: record.is_subclient,
            teacher: record.is_teacher,
        }

        BPlayer.loadPlugin(new BedrockSkin(skin_data))

        return BPlayer
    }
    static getPlayer(p, playerList) {
        return playerList?.getPlayer(p.unique_id)
    }
    static buildPlayer(p, BPlayer) {
        const { username, uuid, gamemode, unique_id, runtime_id, device_id, device_os } = p
        const states = entityParser.states(p)

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