import { BaseModule } from "#Storage/moduleBase";
import { BedrockPlayer } from "#World/Objects/BedrockPlayer";
import { BedrockSkin } from "#Storage/BedrockSkin";
import { V3, V3ToChunk, V3WorldToLocal } from "#extra/extraWorldFunctions";
import { SubChunkHandler } from "./Handlers/subchunk.js";
import { BlobsHandler } from "./Handlers/blobs.js";
import { ByteStream } from "#Core/Storage/Binary/ByteStream";
import { BedrockEntity } from "#Core/World/Objects/BedrockEntity";
import { BedrockItemEntity } from "#Core/World/Objects/BedrockItemEntity";
import { BedrockChunk } from "#Core/World/Objects/BedrockChunk";

export class PacketHandler extends BaseModule {
    packetsActions = {
        '_start_game': (p) => this.onStartGame(p), // fix: remove _ feature and replace with somthing else (for handlePacket method)
        'add_entity': (p) => this.onAddEntity(p),
        'add_player': (p) => this.onAddPlayer(p),
        'add_item_entity': (p) => this.onAddItemEntity(p),
        'level_chunk': (p) => this.onlevelChunk(p),
        'subchunk': (p) => this.onSubchunk(p),
        'set_time': (p) => this.bot.world.time = p.time,
        'game_rules_changed': (p) => this.bot.world.updateGamerules(p?.rules),
        'set_difficulty': (p) => this.bot.world.settings.difficulty = p.difficulty,
        'set_commands_enabled': (p) => this.bot.world.settings.commands = p.enabled,
        'update_block': (p) => this.onUpdateBlock(p),
        'update_block_synced': (p) => this.onUpdateBlock(p),
        'update_subchunk_blocks': (p) => this.onUpdateSubChunkBlocks(p),
        'block_entity_data': (p) => this.onBlockEntityData(p),
        'player_list': (p) => this.onPlayerList(p),
        'remove_entity': (p) => this.onRemoveEntity(p),
        'move_entity_delta': (p) => this.onMoveEntityDelta(p),
        'move_player': (p) => this.onMovePlayer(p),
        'change_dimension': (p) => this.onChangeDimension(p),
        'set_entity_data': (p) => this.onSetEntityData(p),
        'update_attributes': (p) => this.onUpdateAttributes(p),
        'update_abilities': (p) => this.onUpdateAbilities(p),
        'respawn': (p) => { if (this.bot.player) this.bot.player.position = p.position },
        'set_health': (p) => { if (this.bot.player) this.bot.player.health = p.health },
        'update_player_game_type': (p) => this.onUpdatePlayerGamemode(p),
        'set_player_game_type': (p) => this.onUpdatePlayerGamemode(p, true),
        'current_structure_feature': (p) => this.onCurrentStructureFeature(p),
        'player_skin': (p) => this.onPlayerSkin(p),
        'set_entity_motion': (p) => this.onSetEntityMotion(p),
        'event': (p) => this.onEvent(p),
    }

    bindPackets() {
        const actions = this.packetsActions
        for (const [packetName, handler] of Object.entries(actions)) {
            if (packetName.startsWith('_')) this.bot.packets.once(packetName.slice(1), handler)
            else this.bot.packets.on(packetName, handler)
        }
    }
    handlePacket(name, packet) {
        const actions = this.packetsActions
        actions[name](packet)
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

    onSetEntityMotion(p) {
        const { velocity, runtime_entity_id } = p

        const entity = this.bot.world.getEntity(runtime_entity_id)
        if (!entity || !entity.isValid) return

        entity.velocity = velocity
    }

    onAddEntity(p) {
        const {
            entity_type,
            unique_id, runtime_id,
            attributes,
            position, yaw, head_yaw, pitch
        } = p
        const BEntity = new BedrockEntity(this.bot.registry)

        BEntity.create(entity_type, unique_id, runtime_id)
        this.onSetEntityData(p, BEntity)
        BEntity.attributes.update(attributes, false)
        BEntity.update(position, yaw, head_yaw, pitch)

        this.bot.world.events.emit('newMob', BEntity)
        this.bot.world.events.emit('newEntity', BEntity)
        this.bot.world.entities.setEntity(BEntity)
    }
    onAddPlayer(p) {
        const {
            username,
            uuid, unique_id, runtime_id,
            position, yaw, head_yaw, pitch,
            permission_level, gamemode,
            device_id, device_os
        } = p
        const BPlayer = this.bot.server.playerList?.getPlayer(unique_id) ?? new BedrockPlayer(this.bot.registry)

        BPlayer.create(username, unique_id, uuid, runtime_id)
        this.onSetEntityData(p, BPlayer)
        this.onUpdateAbilities(p, BPlayer)
        BPlayer.update(position, yaw, head_yaw, pitch)

        BPlayer.permission = permission_level
        BPlayer.gamemode = gamemode
        BPlayer.device = {
            id: device_id,
            os: device_os,
        }

        this.bot.world.events.emit('newPlayer', BPlayer)
        this.bot.world.events.emit('newEntity', BPlayer)
        this.bot.world.entities.setEntity(BPlayer)
    }
    onAddItemEntity(p) {
        const {
            entity_id_self, runtime_entity_id,
            item,
            position
        } = p
        const { network_id, count, extra } = item
        const BEntity = new BedrockItemEntity(this.bot.registry)

        BEntity.create(entity_id_self, runtime_entity_id, network_id)
        this.onSetEntityData(p, BEntity)
        BEntity.position = position

        if (extra.has_nbt) BEntity.itemStack.nbt = extra.nbt
        BEntity.itemStack.count = count

        this.bot.world.events.emit('newItem', BEntity)
        this.bot.world.events.emit('newEntity', BEntity)
        this.bot.world.entities.setEntity(BEntity)
    }

    onlevelChunk(p) {
        const { x, z, dimension, cache_enabled, payload, blobs } = p
        const BChunk = new BedrockChunk(this.bot.registry)
        const dim = this.bot.world.getDimension(dimension)

        BChunk.create(x, z, dimension)
        BChunk.payloadCache = cache_enabled
        if (cache_enabled && dim.plugins?.BlobsManager) dim.plugins.BlobsManager.addHash(blobs?.hashes, BChunk)

        if (cache_enabled) BChunk.setBorderBlocksPayload(payload)
        else BChunk.setPayload(payload, cache_enabled)

        dim.map.setChunk(BChunk, x, z)
    }
    onSubchunk(p) {
        const { entries, origin, cache_enabled, dimension } = p
        const dim = this.bot.world.getDimension(dimension)
        let chunk

        for (const entry of entries) {
            const pos = V3(origin.x + entry.dx, origin.y + entry.dy, origin.z + entry.dz)
            if (chunk?.position?.x !== pos.x || chunk?.position?.z !== pos.z) {
                chunk = dim.map.getChunk(pos.x, pos.z)
                if (!chunk) continue
            }

            const { payload, heightmap, result, blob_id: hash } = entry
            const BSubChunk = chunk.createSubChunk(pos.y)

            if (cache_enabled) BSubChunk.setBlocksEntityPayload(payload)
            else BSubChunk.setPayload(payload, cache_enabled)

            if (cache_enabled && dim.plugins.BlobsManager && result === 'success') dim.plugins.BlobsManager.addHash(hash, BSubChunk)
        }
    }

    onPlayerSkin(p) {
        const { uuid, skin } = p
        const player = this.bot.server.getPlayer(uuid)
        if (!player || !player.isValid) return

        player.skin.buildFromSkin(skin)
    }

    onEvent(p) {
        const { runtime_id, event_type, use_player_id, event_data } = p
        const stream = new ByteStream(Buffer.from(event_data))
        const world = this.bot.world

        switch (event_type) {
            case "mob_killed": {
                const killerId = stream.readVarLong()
                const entityId = stream.readVarLong()
                const deathCauseId = stream.readVarInt()

                const entity = world.getEntity(entityId)
                const killer = world.getEntity(killerId)
                if (!entity || !entity.isValid) return
            }
                break
        }
    }

    onCurrentStructureFeature(p) {
        if (!this.bot.player) return
        this.bot.player.structure = p.current_feature
    }

    onStartGame(startgame) {
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
        )
        BPlayer.position = player_position
        BPlayer.pitch = rotation.x
        BPlayer.yaw = rotation.z
        BPlayer.gamemode = player_gamemode
        if (BPlayer.gamemode === 5) BPlayer.gamemode = this.bot.world.settings.defaultGamemode // fallback
        BPlayer.dimension = dimension
        BPlayer.permission = permission_level
        BPlayer.enchantmentSeed = enchantment_seed

        bot.world.entities.setEntity(BPlayer)
        bot.player = BPlayer
        bot.log('client', 'Client player class initialized', 0)
    }

    onPlayerList(p) {
        const type = p.records.type
        const playerList = this.bot.server.playerList

        for (const record of p.records.records) {
            switch (type) {
                case 'add':
                    if (playerList.hasPlayer(record.uuid)) continue
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
                    this.bot.server.events.emit('playerJoin', BPlayer)
                    break
                case 'remove':
                    const player = playerList.getPlayer(record.uuid)
                    this.bot.server.events.emit('playerLeave', player)
                    playerList.delPlayer(record.uuid)
                    player.leave()
                    break
            }
        }
    }

    onBlockEntityData(p) {
        const { position, nbt } = p
        const chunkPos = V3ToChunk(position)
        const local = V3WorldToLocal(position)

        const dimension = this.bot.world.getDimension(this.bot.player.dimension)
        const subChunk = dimension.getSubChunk(chunkPos.x, chunkPos.y, chunkPos.z)
        if (!subChunk) return

        subChunk.setBlockEntity(local.x, local.y, local.z, nbt)
        dimension.events.emit('blockNBTUpdate', position)
    }

    onUpdateBlock(p) {
        const { position, block_runtime_id, layer } = p
        const chunkPos = V3ToChunk(position)
        const local = V3WorldToLocal(position)

        const dimension = this.bot.world.getDimension(this.bot.player.dimension)
        const subChunk = dimension.getSubChunk(chunkPos.x, chunkPos.y, chunkPos.z)
        if (!subChunk) return

        subChunk.setBlockId(local.x, local.y, local.z, layer, block_runtime_id)
        dimension.events.emit('blockUpdate', position)
    }

    onUpdateSubChunkBlocks(p) {
        const { blocks, extra } = p
        const dimension = this.bot.world.getDimension(this.bot.player.dimension)

        function setBlockId(v3, layer, id) {
            const chunkPos = V3ToChunk(v3)
            const local = V3WorldToLocal(v3)
            const subChunk = dimension.getSubChunk(chunkPos.x, chunkPos.y, chunkPos.z)
            if (!subChunk) return

            subChunk.setBlockId(local.x, local.y, local.z, layer, id)
        }

        for (const block of blocks) {
            const { position, runtime_id } = block
            setBlockId(position, 0, runtime_id)
            dimension.events.emit('blockUpdate', position)
        }

        for (const block of extra) {
            const { position, runtime_id } = block
            setBlockId(position, 1, runtime_id)
        }
    }

    onUpdateAbilities(p, player) {
        const { permission_level, abilities, entity_unique_id } = p
        player ??= this.bot.server.playerList.getPlayer(entity_unique_id)
        if (!player || !player.isValid) return

        const enabled = abilities[0]?.enabled ?? {}
        player.permission = permission_level
        player.setAbilities(enabled)
        player.events.emit('updateAbilities', player.abilities)
    }

    onSetEntityData(p, entity) {
        const { metadata, runtime_entity_id } = p
        entity ??= this.bot.world.getEntity(runtime_entity_id)
        if (!entity || !entity.isValid) return

        entity.setStates(Object.fromEntries(metadata.flatMap(({ key, value }) => {
            return [[key, value]]
        })))
        entity.events.emit('updateStates', entity.states)
    }

    onUpdatePlayerGamemode(p, local = false) {
        const player = local ? this.bot.player : this.bot.server.playerList.getPlayer(p.player_unique_id)
        if (!player || !player.isValid) return

        player.gamemode = p.gamemode
    }

    onUpdateAttributes(p) {
        const { runtime_entity_id, attributes } = p
        const entity = this.bot.world.getEntity(runtime_entity_id)
        if (!entity || !entity.isValid) return

        entity.attributes.update(attributes)
    }

    onChangeDimension(p) {
        if (!this.bot.player) return
        this.bot.player.dimension = p.dimension
        this.bot.player.position = p.position
    }

    onMovePlayer(p) {
        const player = this.bot.world.getEntity(p.runtime_id)
        if (!player || !player.isValid) return

        const { position, yaw, head_yaw, pitch, mode } = p
        player.update(position, yaw, head_yaw, pitch)
        player.events.emit('move', player)
    }

    onMoveEntityDelta(p) {
        const entity = this.bot.world.getEntity(p.runtime_entity_id)
        if (!entity || !entity.isValid) return

        const { x, y, z, rot_x, rot_y, rot_z } = p
        if (x) entity.position.x = x
        if (y) entity.position.y = y
        if (z) entity.position.z = z
        if (rot_x) entity.rotation.x = rot_x
        if (rot_y) entity.rotation.y = rot_y
        if (rot_z) entity.rotation.z = rot_z

        entity.events.emit('move', entity)
    }

    onRemoveEntity(p) {
        const entities = this.bot.world.entities
        const entity = entities.getEntity(p.entity_id_self)
        if (!entity) return

        entities.delEntity(p.entity_id_self)
        entity.despawn()
        this.bot.world.events.emit('entityDespawn', entity)
    }
}