import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import EntityActions from "./systems/entityActionsSystem.js"

export class PacketWriter extends BaseModule {
    
    setupPacketWriter() {
        this.autoStartGameHandler()
        this.autoEntitiesWriter()
        this.autoEntitiesAction()
        this.autoChunksWriter()
        this.autoSubchunksWriter()
        if (this.bot.options.client.settings.cache) this.autoCacheWriter()
    }

    autoStartGameHandler() {
        const bot = this.bot
        bot.packets.once('start_game', (startgame) => {
            bot.world.create(startgame)
            bot.log('autoph', `World startgame initialized`)
        })
    }

    autoEntitiesWriter() {
        const bot = this.bot
        const entityWriter = (entity, type) => {
            const dimension = bot.world.getDimension(0)
            dimension.addEntity(entity, type)
        }
        
        bot.packets.on('add_entity', (p) => entityWriter(p, 0))
        bot.packets.on('add_player', (p) => entityWriter(p, 1))
        
        bot.packets.on('set_entity_data', entityWriter)
        bot.packets.on('update_attributes', entityWriter)
        bot.packets.on('update_abilities', (p) => entityWriter(p, 1))
    }
    
    autoEntitiesAction() {
        this.entityActions = new EntityActions(this.bot)
        this.entityActions.entityActionsLoop()
    }

    autoChunksWriter() {
        const bot = this.bot
        bot.packets.on('level_chunk', (chunk) => {
            const dimension = bot.world.getDimension(chunk.dimension)
            dimension.addChunk(chunk)
        })
    }

    autoSubchunksWriter() {
        const bot = this.bot
        bot.packets.on('subchunk', (subchunks) => {
            const dimension = bot.world.getDimension(subchunks.dimension)
            dimension.addSubChunks(subchunks)
        })
    }
    
    autoCacheWriter() {
        const bot = this.bot
        bot.packets.on('client_cache_miss_response', (p) => {
            const { blobs } = p
            const blobsManager = bot?.world?.blobsManager
            if (!blobsManager) throw new TypeError('Cannot work with blobs without blobsManager')

            for (const blob of blobs) {
                const { hash, payload } = blob
                if (blobsManager.hasPayload(hash)) continue
                blobsManager.addPayload(hash, payload)
            }
        })
    }
}