import Player from "./player.js"

export default class Server {
    static metadata(serverData, p = {}) {
        return {
            host: serverData.host,
            port: serverData.port,
            offline: serverData.offline,
            engine: p.engine || '',
            identifier: p.server_identifier || '',
            correlationId: p.multiplayer_correlation_id || '',
            blockPalleteChecksum: p.block_pallette_checksum || [0, 0],
            authority: {
                movement: p.movement_authority || '',
                blocks: p.server_authoritative_block_breaking || '',
                inventory: p.server_authoritative_inventory || '',
                soundControllByServer: p.server_controlled_sound || false,
                clientSideGeneration: p.client_side_generation || false,
            },
            settings: {
                lan: p.broadcast_to_lan || false,
                xboxLiveMode: p.xbox_live_broadcast_mode || 0,
                platformMode: p.platform_broadcast_mode || 0,
                chunkTickRange: p.server_chunk_tick_range || 0,
                lockedBP: p.has_locked_behavior_pack || false,
                lockedRP: p.has_locked_resource_pack || false,
                msaGamertags: p.msa_gamertags_only || false,
                modelSkins: !p.persona_disabled || false,
                customSkins: !p.custom_skins_disabled || false,
                emoteChat: p.emote_chat_muted || false,
                chatRestriction: p.chat_restriction_level || '',
                blocksNetworkIdsHashed: p.block_network_ids_are_hashes || false,
            }
        }
    }

    static buildServer(server, startgame = undefined) {
        
    }

    static buildPlayerListByPacket(p, playerList) {
        const type = p.records.type
        for (const record of p.records.records) {
            switch (type) {
                case 'add': Player.buildPlayerFromRecord(record, playerList)
                break
                case 'remove': Player.removePlayerFromRecord(record, playerList)
                break
            }
            
        }
    }
}