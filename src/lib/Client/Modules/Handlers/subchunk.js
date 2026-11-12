import { BaseModule } from "#Storage/moduleBase";
import { BedrockThread } from "#Storage/BedrockThread";
import { packV3, roundV3, unpackV3, V3ToChunk } from "#extra/extraWorldFunctions"
import { getClampedRandom } from "#extra/packetRandom";
import { statusList } from '#Client/BaseBedrockBot';
import { DIMENSIONS_DATA as dimData } from "#Storage/constants";

export class SubChunkHandler extends BaseModule {
    loadQueue = new BedrockThread()

    startCollectChunks() {
        this.bot.packets.on('level_chunk', (p) => {
            const { x, z, highest_subchunk_count = dimData[p.dimension].minCY } = p
            this.loadQueue.push(packV3(x, highest_subchunk_count, z))
        })
    }
    startRequestSubChunks() {
        const packets = this.bot.packets
        const world = this.bot.world
        const player = this.bot.player

        const requestSubChunks = () => {
            if (!world.isCreated || this.loadQueue.length <= 0) return
            const originPos = roundV3(player.position.x, 0, player.position.z)
            const origin = V3ToChunk(originPos.x, originPos.y, originPos.z)
            const dimension = player.dimension

            const subchunksToSend = Math.trunc(getClampedRandom(35, 3, 65, 0.4))
            const minY = dimData[dimension].minCY
            const requests = []

            for (let i = 0; i < this.loadQueue.length; i++) {
                if (requests.length >= subchunksToSend) break
                const chunk = unpackV3(this.loadQueue.next())
                const dx = chunk.x - origin.x
                const dz = chunk.z - origin.z
                const maxY = minY + chunk.y // chunk.y == highest_subchunk_count
                if (minY === maxY) requests.push({ dx, dy: minY, dz })
                else {
                    for (let dy = minY; dy <= maxY; dy++) {
                        requests.push({ dx, dy, dz })
                    }
                }

                world.getDimension(dimension).events.emit('chunkLoaded', chunk)
            }
            if (!requests.length) return

            //this.bot.log('world', `request subchunks: ${requests.length} total, ${subchunksToSend} needed`, 0)
            packets.queue('subchunk_request', {
                dimension,
                origin,
                requests
            })
        }

        const requester = setInterval(() => {
            if (this.bot.status <= statusList.Disconnected) return
            requestSubChunks()
        }, this.bot.options.config.fastLoading ? 10 : 100)

        this.bot.packets.once('close', () => clearInterval(requester))
    }

}