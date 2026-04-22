import { World, Protocol as ProtocolValidator } from 'minetoring'
import { rawChunk, rawSubs, data, parseBigIntToString } from './bigData/index.js'
import { V3 } from '#extra/extraWorldFunctions';

const Protocol = new ProtocolValidator('1.21')
await Protocol.init()

const world = new World('1.21.50', {ProtocolValidator: Protocol})
world.create(data.startGame)

const worldData = {
    name: world.metadata.name,
    seed: world.metadata.seed.world,
    dimension: world.metadata.players.spawnpoint.dimension,
}
console.log(`World Intiated with metadata: ${JSON.stringify(worldData, parseBigIntToString, 1)}`)

const overworld = world.getDimension(0)
overworld.add({ chunk: rawChunk, subChunks: rawSubs })

const chunk = overworld.getChunk(0, 0)
const logs = {
    chunk: chunk.hasChunk,
    subchunks: chunk.hasSubChunks,
    chunkMeta: chunk.metadata,
    sub0: {
        meta: chunk.subChunks[0].metadata,
        data: chunk.subChunks[0].data.raw
    }
}

console.log(`Chunk added to world dimension with data: ${JSON.stringify(logs, parseBigIntToString, 1)}`)

await overworld.validateChunk(0, 0)
const PChunk = chunk.DChunk
console.log(PChunk.getSection(0).getPalette())

const PChunkData = {
    sections: PChunk.maxCY,
    entities: PChunk.entities.length,
    blockAt0: PChunk.getBlock(V3(0, 0, 0)),
    blockAt1: PChunk.getBlock(1, 0, 1),
    blockAt2: PChunk.getBlock(2, 0, 2),
    blockAt3: PChunk.getBlock(3, 0, 3),
}

console.log(`Chunk validated, prismarine chunk data: ${JSON.stringify(PChunkData, parseBigIntToString, 1)}`)

chunk.toRaw()

console.log(`Chunk data after toRaw call: ${JSON.stringify({
    hasChunk: chunk.hasChunk,
    hasSubChunks: chunk.hasSubChunks,
    isRaw: chunk.isRaw
}, parseBigIntToString, 1)}`)

console.log('Test completed successfuly')