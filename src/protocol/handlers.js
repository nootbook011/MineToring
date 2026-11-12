import { BedrockEntity } from "#Core/World/BedrockEntity"
import { BedrockPlayer } from "#Core/World/BedrockPlayer"
import { BedrockItemEntity } from "#Core/World/BedrockItemEntity"
import { BedrockSkin } from "#Storage/BedrockSkin"
import { ByteStream } from "#Core/Storage/Binary/ByteStream"
import { V3 } from "#extra/extraWorldFunctions"
import { GAMEMODES } from "#Storage/constants"
import { ChunkBiomesCodec, ChunkBorderBlocksCodec } from "./codecs/chunk.js"
import { SubChunkBlocksEntityCodec, SubChunkCodec } from "./codecs/subchunk.js"

/**
 * @param {import("#protocol/PacketsRegistry").PacketsRegistry} packetsRegistry
 * @param {import("#lib/Client/BedrockBot").BedrockBot} bot
 */
export function loadPacketHandlers(packetsRegistry, bot) {
    const { world, playerList, events } = bot
    const l = packetsRegistry.loadHandler.bind(packetsRegistry)

    function parseGamerules(gamerules) {
        const result = {}
        for (const gamerule of gamerules) {
            const { name, value } = gamerule
            result[name] = value
        }
        return result
    }
    function parseExperiments(experiments) {
        const result = {}
        for (const experiment of experiments) {
            const { name, enabled } = experiment
            result[name] = enabled
        }
        return result
    }

    function parseEntityMetadata(metadata) {
        return Object.fromEntries(metadata.flatMap(({ key, value }) => [[key, value]]))
    }
    function parsePlayerAbilities(abilities) {
        return abilities[0]?.enabled ?? {}
    }


    l('start_game', (p) => {
        initRegistry()
        initWorld()
        initLocalPlayer()

        function initRegistry() {
            const { itemstates, block_network_ids_are_hashes, engine } = p
            const registry = world.registry ?? world.init(engine)
            registry.loadItemStates(itemstates)

            if (block_network_ids_are_hashes) registry.loadHashedRuntimeIds()
            else registry.loadRuntimeIds()
        }
        function initWorld() {
            const {
                world_name,
                difficulty, hardcore, world_gamemode,
                seed, generator, spawn_position,
                achievements_disabled, map_enabled, bonus_chest, enable_commands,
                server_chunk_tick_range, edu_features_enabled, day_cycle_stop_time,
                gamerules, experiments,
            } = p

            world.create({
                name: world_name,
                defaultGamemode: GAMEMODES[world_gamemode],
                difficulty: difficulty,
                hardcore: hardcore,
                spawnWithMap: map_enabled,
                bonusChest: bonus_chest,
                generator: generator,
                seed: BigInt(seed),
                spawnpoint: spawn_position,
                chunkTickRange: server_chunk_tick_range,
                achievements: !achievements_disabled,
                commands: enable_commands,
                eduFeatures: edu_features_enabled,
            })

            world.time = day_cycle_stop_time
            world.setGamerules(parseGamerules(gamerules))
            world.setExperiments(parseExperiments(experiments))

            if (bot) bot.log('world', 'World startgame initialized', 0)
        }
        function initLocalPlayer() {
            const {
                entity_id, runtime_entity_id,
                player_gamemode,
                player_position,
                permission_level, rotation, dimension, enchantment_seed
            } = p
            const BPlayer = bot.playerList.getPlayer(bot.username) ?? new BedrockPlayer(bot.registry)

            BPlayer.create(
                bot.username,
                entity_id,
                BPlayer.uuid ? BPlayer.uuid : bot.session.uuid,
                runtime_entity_id
            )
            BPlayer.position = player_position
            BPlayer.pitch = rotation.x
            BPlayer.yaw = rotation.z
            BPlayer.gamemode = player_gamemode == GAMEMODES.fallback
                ? world.settings.defaultGamemode ?? GAMEMODES.survival
                : player_gamemode
            BPlayer.dimension = dimension
            BPlayer.permission = permission_level
            BPlayer.enchantmentSeed = enchantment_seed

            world.addEntity(BPlayer)
            bot.player = BPlayer
            bot.log('client', 'Client player class initialized', 0)
        }
    })

    l('add_entity', (p) => {
        const {
            entity_type,
            unique_id, runtime_id,
            attributes, metadata,
            position, yaw, head_yaw, pitch
        } = p
        const BEntity = new BedrockEntity(world.registry)

        BEntity.create(entity_type, unique_id, runtime_id)
        BEntity.position = position
        BEntity.yaw = yaw
        BEntity.headYaw = head_yaw
        BEntity.pitch = pitch
        BEntity.dimension = bot.player.dimension

        BEntity.setStates(parseEntityMetadata(metadata))
        BEntity.attributes.update(attributes, false)

        world.addEntity(BEntity)
    })

    l('add_player', (p) => {
        const {
            username,
            uuid, unique_id, runtime_id,
            position, yaw, head_yaw, pitch,
            permission_level, gamemode,
            metadata, abilities,
            device_id, device_os
        } = p
        const BPlayer = bot?.playerList?.getPlayer(unique_id) ?? new BedrockPlayer(world.registry)

        BPlayer.create(username, unique_id, uuid, runtime_id)
        BPlayer.position = position
        BPlayer.yaw = yaw
        BPlayer.headYaw = head_yaw
        BPlayer.pitch = pitch
        BPlayer.dimension = bot.player.dimension

        BPlayer.setStates(parseEntityMetadata(metadata))
        BPlayer.setAbilities(parsePlayerAbilities(abilities))

        BPlayer.permission = permission_level
        BPlayer.gamemode = gamemode == GAMEMODES.fallback
            ? world.settings.defaultGamemode ?? GAMEMODES.survival
            : gamemode
        BPlayer.device = {
            id: device_id,
            os: device_os,
        }

        world.addEntity(BPlayer)
    })

    l('add_item_entity', (p) => {
        const {
            entity_id_self, runtime_entity_id,
            item,
            position, metadata
        } = p
        const { network_id, count, extra } = item
        const BEntity = new BedrockItemEntity(world.registry)

        BEntity.create(entity_id_self, runtime_entity_id, network_id)
        BEntity.setStates(parseEntityMetadata(metadata))
        BEntity.position = position
        BEntity.dimension = bot.player.dimension

        if (extra.has_nbt) BEntity.itemStack.nbt = extra.nbt
        BEntity.itemStack.count = count

        world.addEntity(BEntity)
    })

    l('remove_entity', (p) => {
        const { entity_id_self } = p
        const entity = world.getEntityByUniqueId(entity_id_self)
        if (!entity) return
        
        world.despawnEntity(entity)
    })

    l('move_entity_delta', (p) => {
        const { runtime_entity_id, x, y, z, rot_x, rot_y, rot_z } = p
        const entity = world.getEntityByRuntimeId(runtime_entity_id)
        if (!entity?.isValid) return

        entity.updatePosition(x, y, z)
        entity.updateRotation(rot_x, rot_y, rot_z)
    })

    l('move_player', (p) => {
        const { runtime_id, position, yaw, pitch, head_yaw } = p
        const player = world.getEntityByRuntimeId(runtime_id)
        if (!player?.isValid) return

        player.position = position
        player.updateRotation(pitch, yaw)
        player.headYaw = head_yaw
    })

    l('set_entity_motion', (p) => {
        const { velocity, runtime_entity_id } = p
        const entity = world.getEntityByRuntimeId(runtime_entity_id)
        if (!entity?.isValid) return

        entity.velocity = velocity
    })

    l('set_entity_data', (p) => {
        const { metadata, runtime_entity_id } = p
        const entity = world.getEntityByRuntimeId(runtime_entity_id)
        if (!entity?.isValid) return

        entity.setStates(parseEntityMetadata(metadata))
    })

    l('update_attributes', (p) => {
        const { runtime_entity_id, attributes } = p
        const entity = world.getEntityByRuntimeId(runtime_entity_id)
        if (!entity?.isValid) return
        entity.attributes.update(attributes)
    })

    l('update_abilities', (p) => {
        const { permission_level, abilities, entity_unique_id } = p
        const player = bot?.playerList?.getPlayer(entity_unique_id)
        if (!player?.isValid) return

        player.permission = permission_level
        player.setAbilities(parsePlayerAbilities(abilities))
    })

    // ===== chunks =====

    l('level_chunk', (p) => {
        const { x, z, dimension: dimensionId, cache_enabled, payload, blobs } = p
        const dimension = world.getDimension(dimensionId)
        const BlobsManager = dimension.plugins.BlobsManager

        const BChunk = dimension.createChunk(x, z)
        if (cache_enabled && BlobsManager) BlobsManager.addHash(blobs?.hashes, BChunk)

        if (cache_enabled) ChunkBorderBlocksCodec.decode(payload, BChunk)
        else ChunkBiomesCodec.decode(payload, BChunk)
    })

    l('subchunk', (p) => {
        const { entries, origin, cache_enabled, dimension: dimensionId } = p
        const dimension = world.getDimension(dimensionId)
        const BlobsManager = dimension.plugins.BlobsManager
        let BChunk

        for (const entry of entries) {
            const pos = V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
            if (BChunk?.position?.x !== pos.x || BChunk?.position?.z !== pos.z) {
                BChunk = dimension.getChunk(pos.x, pos.z)
                if (!BChunk) continue
            }

            const { payload, result, blob_id: hash } = entry
            const BSubChunk = BChunk.createSubChunk(pos.y)
            if (cache_enabled && BlobsManager && result === 'success') BlobsManager.addHash(hash, BSubChunk)

            if (cache_enabled) SubChunkBlocksEntityCodec.decode(payload, BSubChunk)
            else SubChunkCodec.decode(payload, BSubChunk)
        }
    })

    l('client_cache_miss_response', (p) => {
        const { blobs } = p
        const blobsManager = world.plugins.BlobsManager
        if (!blobsManager) return

        for (const blob of blobs) {
            const { hash, payload } = blob
            if (blobsManager.hasPayload(hash)) continue
            blobsManager.addPayload(hash, payload)
        }
    })

    // ===== blocks =====

    l('update_block', (p) => {
        const { position, block_runtime_id, layer } = p
        const { x, y, z } = position

        const dimension = world.getDimension(bot.player.dimension)
        dimension.setBlockId(x, y, z, layer, block_runtime_id)
        dimension.deleteBlockEntity(x, y, z)
    })

    l('update_block_synced', (p) => {
        const { position, block_runtime_id, layer } = p
        const { x, y, z } = position

        const dimension = world.getDimension(bot.player.dimension)
        dimension.setBlockId(x, y, z, layer, block_runtime_id)
        dimension.deleteBlockEntity(x, y, z)
    })

    l('update_subchunk_blocks', (p) => {
        const { blocks, extra } = p
        const dimension = world.getDimension(bot.player.dimension)

        for (const block of blocks) {
            const { position, runtime_id } = block
            const { x, y, z } = position
            dimension.setBlockId(x, y, z, 0, runtime_id)
            dimension.deleteBlockEntity(x, y, z)
        }
        for (const block of extra) {
            const { position, runtime_id } = block
            const { x, y, z } = position
            dimension.setBlockId(x, y, z, 1, runtime_id)
        }
    })

    l('block_entity_data', (p) => {
        const { position, nbt } = p

        world.getDimension(bot.player.dimension).setBlockEntity(position.x, position.y, position.z, nbt)
    })

    // ===== world settings =====

    l('set_time', (p) => { world.time = p.time })

    l('level_event', (p) => {
        const { event, position, data } = p

        switch (event) {
            case 'start_rain': world.rain = true; break
            case 'stop_rain': world.rain = false; break
            case 'start_thunder': world.thunder = true; break
            case 'stop_thunder': world.thunder = false; break
        }
    })

    l('game_rules_changed', (p) => {
        const { rules } = p

        world.setGamerules(parseGamerules(rules))
    })

    l('set_difficulty', (p) => { world.setSettings(p) })

    l('set_commands_enabled', (p) => { world.setSettings({ commands: p.enabled }) })

    // ===== player =====

    l('respawn', (p) => { if (bot.player) bot.player.position = p.position })

    l('set_health', (p) => { if (bot.player) bot.player.health = p.health })

    l('update_player_game_type', (p) => {
        const { player_unique_id, gamemode } = p
        const player = playerList.getPlayerByUniqueId(player_unique_id)
        if (!player?.isValid) return
        player.gamemode = gamemode
    })

    l('set_player_game_type', (p) => {
        if (!bot.player?.isValid) return
        bot.player.gamemode = p.gamemode
    })

    l('player_skin', (p) => {
        const { uuid, skin } = p
        const player = playerList?.getPlayerByUUID(uuid)
        if (!player?.isValid) return
        player.skin.buildFromSkin(skin)
    })

    l('player_list', (p) => {
        const type = p.records.type

        for (const record of p.records.records) {
            switch (type) {
                case 'add': {
                    if (playerList.hasPlayerByUUID(record.uuid)) continue
                    const { username, uuid, entity_unique_id, skin_data } = record
                    const player = new BedrockPlayer(world.registry)

                    player.create(username, entity_unique_id, uuid)
                    player.loadPlugin(new BedrockSkin(skin_data))
                    player.xuid = record.xbox_user_id
                    player.platformChatId = record.platform_chat_id
                    player.role = {
                        host: record.is_host,
                        subclient: record.is_subclient,
                        teacher: record.is_teacher,
                    }

                    playerList.addPlayer(player)
                    bot.events.emit('playerJoin', player)
                    break
                }
                case 'remove': {
                    const player = playerList.getPlayerByUUID(record.uuid)
                    if (!player) return
                    
                    playerList.delPlayer(player)
                    player.leave()
                    bot.events.emit('playerLeave', player)
                    break
                }
            }
        }
    })

    l('change_dimension', (p) => {
        if (!bot.player) return
        bot.player.dimension = p.dimension
        bot.player.position = p.position
    })

    l('current_structure_feature', (p) => {
        if (!bot.player) return
        bot.player.structure = p.current_feature
    })

    // ===== misc =====

    l('event', (p) => {
        const { event_type, event_data } = p
        const stream = new ByteStream(Buffer.from(event_data))

        switch (event_type) {
            case "mob_killed": {
                const killerId = stream.readVarLong()
                const entityId = stream.readVarLong()
                // const deathCauseId = stream.readVarInt() // не используется

                const entity = world.getEntityByUniqueId(entityId)
                const killer = world.getEntityByUniqueId(killerId)
                if (!entity || !entity.isValid) return
                if (!killer || !killer.isValid) return
                break
            }
        }
    })
}