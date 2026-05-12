import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import entityParser from "./Parsers/entity.js"

import { EntityActionsHandler } from "./Handlers/entityActions.js"
import { WorldHandler } from "./Handlers/world.js";
import { BlobsHandler } from "./Handlers/blobs.js"
import { SubChunkHandler } from "./Handlers/subchunk.js"
import Player from "./Parsers/player.js";
import Server from "./Parsers/server.js";

export default class HandlersManager extends BaseModule {

    worldHandler() {
        const handler = this.bot.loadPlugin(WorldHandler)
        handler.startWorldUpdate()
    }
    startGameHandler() {
        const bot = this.bot
        bot.packets.once('start_game', (startgame) => {
            bot.world.create(startgame)
            bot.server.create(bot.options.server, startgame)
            bot.log('world', `World startgame initialized`, 0)
        })
    }
    startGamePlayerInject() {
        this.bot.packets.once('start_game', (p) => {
            this.bot.player = entityParser.buildPlayerFromStartgame(p, this.bot)
            this.bot.log('client', `Client player class initialized`, 0)
        })
    }

    playerListHandler() {
        this.bot.packets.on('player_list', (p) => {
            Server.handlePlayerList(p, this.bot.server.playerList)
        })
    }

    entitiesHandler() {
        const bot = this.bot
        const entityWriter = (entity, type) => {
            bot.world.addEntity(entity, type, bot.server.playerList)
        }
        
        bot.packets.on('add_entity', (p) => entityWriter(p, 0))
        bot.packets.on('add_player', (p) => entityWriter(p, 1))
    }
    entitiesActionsHandler() {
        const handler = this.bot.loadPlugin(EntityActionsHandler)
        handler.startEntityActions()
    }

    chunksHandler() {
        const bot = this.bot
        bot.packets.on('level_chunk', (chunk) => {
            const dimension = bot.world.getDimension(chunk.dimension)
            dimension.addChunk(chunk)
        })
    }
    subchunksHandler() {
        const bot = this.bot
        bot.packets.on('subchunk', (subchunks) => {
            const dimension = bot.world.getDimension(subchunks.dimension)
            dimension.addSubChunks(subchunks)
        })
        
        const handler = this.bot.loadPlugin(SubChunkHandler)
        handler.startCollectChunks()
    }
    
    blobsCacheHandler() {
        const bot = this.bot
        bot.packets.on('client_cache_miss_response', (p) => {
            const { blobs } = p
            const blobsManager = bot?.world?.plugins?.BlobsManager
            if (!blobsManager) throw new TypeError('Cannot work with blobs without blobsManager')

            for (const blob of blobs) {
                const { hash, payload } = blob
                if (blobsManager.hasPayload(hash)) continue
                blobsManager.addPayload(hash, payload)
            }
        })
        
        const handler = this.bot.loadPlugin(BlobsHandler)
        handler.startCollectChunks()
    }
    
    startRequestSubchunks() {
        const handler = this.bot.plugins.SubChunkHandler
        if (!handler) return
        handler.startRequestSubChunks()
    }
    startRequestBlobs() {
        const handler = this.bot.plugins.BlobsHandler
        if (!handler) return
        handler.startRequestBlobs()
    }
}