import { BaseModule } from "#Base/BedrockStorage/moduleBase";
import EntityActions from "./systems/entityActionsSystem.js"
import WorldUpdater from "./systems/WorldUpdater.js";

export class PacketWriter extends BaseModule {
    setupPacketWriter() {
        this.autoStartGameHandler()
        this.autoEntitiesWriter()
        this.autoEntitiesAction()
        this.autoChunksWriter()
        this.autoSubchunksWriter()
        this.autoActionsEmit()
        this.autoWorldUpdate()
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
            const dimension = bot.world.getDimension(bot.player.dimension)
            if (!dimension) console.log(111)
            dimension.addEntity(entity, type)
        }
        
        bot.packets.on('add_entity', (p) => entityWriter(p, 0))
        bot.packets.on('add_player', (p) => entityWriter(p, 1))
    }
    
    autoEntitiesAction() {
        this.entityActions = new EntityActions(this.bot)
        this.entityActions.entityActionsLoop()
    }

    autoWorldUpdate() {
        this.worldUpdater = new WorldUpdater(this.bot)
        this.worldUpdater.WorldUpdateLoop()
    }

    autoActionsEmit() {
        const packets = this.bot.packets
        const emitAction = (name, data) => this.bot.actions.events.emit(name, data)
        const actions = {
            'text': (p) => emitAction('chat', {
                type: p.type,
                from: {
                    name: p?.source_name,
                    xuid: p?.xuid,
                },
                text: p.message,
            })
        }

        for (const action in actions) {
            packets.on(action, actions[action])
        }
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