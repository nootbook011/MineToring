import { BaseModule } from "#Storage/moduleBase";
import { BedrockPlayer } from "#World/bedrockObjects/BaseBedrockPlayer";
import { BedrockSkin } from "#World/Modules/Skin";
import { V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { SubChunkHandler } from "./Handlers/subchunk.js";
import { BlobsHandler } from "./Handlers/blobs.js";

export class PacketHandler extends BaseModule {
    bindPackets() {
        const actions = {
            '_start_game': (p) => this.#handleStartGame(p),
            'add_entity': (p) => this.#addEntityToWorld(p, 0),
            'add_player': (p) => this.#addEntityToWorld(p, 1),
            'level_chunk': (p) => this.bot.world.getDimension(p.dimension)?.addChunk(p),
            'subchunk': (p) => this.bot.world.getDimension(p.dimension)?.addSubChunks(p),
            'set_time': (p) => this.#setTime(p),
            'game_rules_changed': (p) => this.#gamerulesChange(p),
            'set_difficulty': (p) => this.#difficultyChange(p),
            'set_commands_enabled': (p) => this.#commandsEnabledChange(p),
            'update_block': (p) => this.#updateBlock(p),
            'block_entity_data': (p) => this.#updateBlockNbt(p),
            'player_list': (p) => this.#updatePlayerList(p),
            'remove_entity': (p) => this.#removeEntity(p),
            'move_entity_delta': (p) => this.#moveEntity(p),
            'move_player': (p) => this.#movePlayer(p),
            'change_dimension': (p) => this.#playerChangeDimension(p),
            'set_entity_data': (p) => this.#updateStates(p),
            'update_attributes': (p) => this.#updateAttributes(p),
            'update_abilities': (p) => this.#updateAbilities(p),
            'respawn': (p) => { if (this.bot.player) this.bot.player.position = p.position },
            'set_health': (p) => { if (this.bot.player) this.bot.player.health = p.health },
            'update_player_game_type': (p) => this.#updateGamemode(p),
            'set_player_game_type': (p) => this.#updateGamemode(p, true),
        }

        for (const [packetName, handler] of Object.entries(actions)) {
            if (packetName.startsWith('_')) this.bot.packets.once(packetName.slice(1), handler)
            else this.bot.packets.on(packetName, handler)
        }
    }

    addBlobsHandler() {
        const bot = this.bot
        bot.packets.on('client_cache_miss_response', (p) => {
            const { blobs } = p
            const blobsManager = bot.world.plugins.BlobsManager
            if (!blobsManager) throw new TypeError('Cannot work with blobs without blobsManager')

            for (const blob of blobs) {
                const { hash, payload } = blob
                if (blobsManager.hasPayload(hash)) continue
                blobsManager.addPayload(hash, payload)
            }
        })

        return bot.loadPlugin(BlobsHandler)
    }

    addSubChunkHandler() {
        return this.bot.loadPlugin(SubChunkHandler)
    }

    // --- Private Packet Handlers ---
    #addEntityToWorld(p, type) { this.bot.world.addEntity(p, type, this.bot.server.playerList) }
    #setTime(p) { this.bot.world.time = p.time }
    #gamerulesChange(p) { this.bot.world.gamerules.update(p?.rules) }
    #difficultyChange(p) { this.bot.world.settings.difficulty = p.difficulty }
    #commandsEnabledChange(p) { this.bot.world.settings.commands = p.enabled }

    #handleStartGame(startgame) {
        const bot = this.bot
        bot.world.create(startgame)
        bot.server.create(startgame)
        bot.log('world', 'World startgame initialized', 0)

        const { player_gamemode, player_position, permission_level, rotation, dimension, enchantment_seed } = startgame
        let BPlayer = bot.server.getPlayer(bot.username) ?? new BedrockPlayer(bot.registry)

        BPlayer.create(
            bot.username,
            startgame.entity_id,
            BPlayer.uuid ? BPlayer.uuid : bot.session.uuid,
            startgame.runtime_entity_id
        );
        BPlayer.position = player_position
        BPlayer.rotation = rotation
        BPlayer.gamemode = player_gamemode
        if (BPlayer.gamemode === 5) BPlayer.gamemode = this.bot.world.settings.defaultGamemode // fallback
        BPlayer.dimension = dimension
        BPlayer.permission = permission_level
        BPlayer.enchantmentSeed = enchantment_seed

        bot.world.entities.setEntity(BPlayer)
        bot.player = BPlayer
        bot.log('client', 'Client player class initialized', 0)
    }

    #updatePlayerList(p) {
        const type = p.records.type
        const playerList = this.bot.server.playerList

        for (const record of p.records.records) {
            switch (type) {
                case 'add':
                    if (playerList.hasPlayer(record.uuid)) return
                    const { username, uuid, entity_unique_id, skin_data } = record
                    const BPlayer = new BedrockPlayer(this.bot.world.registry)

                    BPlayer.create(username, entity_unique_id, uuid)
                    BPlayer.loadPlugin(new BedrockSkin(skin_data))
                    BPlayer.xuid = record.xbox_user_id
                    BPlayer.platformChatId = record.platform_chat_id
                    BPlayer.role = {
                        host: record.is_host,
                        subclient: record.is_subclient,
                        teacher: record.is_teacher,
                    }

                    playerList.setPlayer(BPlayer)
                    break
                case 'remove':
                    playerList.delPlayer(record.uuid)
                    break
            }
        }
    }

    #updateBlockNbt(p) {
        const { position, nbt } = p
        const chunkPos = V3ToChunk(position)
        const local = V3WorldToLocal(position)

        const subChunk = this.bot.world.getDimension(this.bot.player.dimension)?.getSubChunk(chunkPos.x, chunkPos.y, chunkPos.z)
        if (!subChunk) return

        subChunk.setBlockEntity(local.x, local.y, local.z, nbt)
    }

    #updateBlock(p) {
        const { position, block_runtime_id, layer } = p
        const chunkPos = V3ToChunk(position)
        const local = V3WorldToLocal(position)

        const subChunk = this.bot.world.getDimension(this.bot.player.dimension)?.getSubChunk(chunkPos.x, chunkPos.y, chunkPos.z)
        if (!subChunk) return

        subChunk.setBlockId(local.x, local.y, local.z, layer, block_runtime_id)
    }

    #updateAbilities(p) {
        const player = this.bot.server.playerList.getPlayer(p.entity_unique_id)
        if (!player) return

        player.permission = p.permission_level
        player.updateAbilitiesFromPacket(p)
        player.events.emit('abilities', player.abilities)
    }

    #updateStates(p) {
        const entity = this.bot.world.getEntity(p.runtime_entity_id)
        if (!entity) return

        entity.updateStatesFromPacket(p)
        entity.events.emit('states', entity.states)
    }

    #updateGamemode(p, local = false) {
        const player = local ? this.bot.player : this.bot.server.playerList.getPlayer(p.player_unique_id)
        if (!player) return

        player.gamemode = p.gamemode
    }

    #updateAttributes(p) {
        const entity = this.bot.world.getEntity(p.runtime_entity_id)
        if (!entity) return

        entity.attributes.update(p?.attributes)
        if (entity.health <= 0) {
            entity.events.emit('death')
        }
    }

    #playerChangeDimension(p) {
        if (!this.bot.player) return
        this.bot.player.dimension = p.dimension
        this.bot.player.position = p.position
    }

    #movePlayer(p) {
        const player = this.bot.world.getEntity(p.runtime_id)
        if (!player) return

        const { position, yaw, head_yaw, pitch } = p
        player.updatePhysics(position, yaw, head_yaw, pitch)
        player.events.emit('move', player)
    }

    #moveEntity(p) {
        const entity = this.bot.world.getEntity(p.runtime_entity_id)
        if (!entity) return

        const { x, y, z, rot_x, rot_y, rot_z } = p
        if (x) entity.position.x = x
        if (y) entity.position.y = y
        if (z) entity.position.z = z
        if (rot_x) entity.rotation.x = rot_x
        if (rot_y) entity.rotation.y = rot_y
        if (rot_z) entity.rotation.z = rot_z

        entity.events.emit('move', entity)
    }

    #removeEntity(p) {
        const entities = this.bot.world.entities
        const entity = entities.getEntity(p.entity_id_self)
        if (!entity) return

        entities.delEntity(p.entity_id_self)
        entity.events.emit('despawn')
    }
}