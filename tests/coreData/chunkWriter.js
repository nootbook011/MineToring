import { World, Protocol as ProtocolValidator } from 'minetoring'
import { rawChunk, rawSubs, data, parseBigIntToString } from '../bigData/index.js'
import { V3 } from '#extra/extraWorldFunctions';

function safeStringify(obj, replacer = undefined, space = 1, options = {}) {
    const seen = new WeakSet();
    const maxArrayLength = options.maxArrayLength ?? 64;
    const maxBytesPreview = options.maxBytesPreview ?? 16;

    function summarizeBuffer(value) {
        // Node Buffer
        try {
            if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
                const len = value.length;
                const preview = value.slice(0, maxBytesPreview).toString('hex');
                return `<Buffer len=${len} start=0x${preview}${len > maxBytesPreview ? '...' : ''}>`;
            }
        } catch (e) {}

        // TypedArray / DataView
        try {
            if (ArrayBuffer.isView(value)) {
                const len = value.byteLength;
                const ctor = value.constructor?.name ?? 'TypedArray';
                const arr = Array.prototype.slice.call(value, 0, Math.min(value.length ?? 0, maxBytesPreview));
                const preview = arr.map(b => (b & 0xff).toString(16).padStart(2, '0')).join('');
                return `<${ctor} len=${len} start=0x${preview}${len > maxBytesPreview ? '...' : ''}>`;
            }
        } catch (e) {}

        // ArrayBuffer
        try {
            if (value instanceof ArrayBuffer) {
                return `<ArrayBuffer len=${value.byteLength}>`;
            }
        } catch (e) {}

        return value;
    }

    return JSON.stringify(obj, function (key, value) {
        if (typeof value === 'bigint') return value.toString();

        // Buffers and binary views
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(value)) return summarizeBuffer(value);
        if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return summarizeBuffer(value);

        // Long arrays -> summarize by length
        if (Array.isArray(value) && value.length > maxArrayLength) return `[Array len=${value.length}]`;

        if (value && typeof value === 'object') {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
        }

        if (typeof replacer === 'function') {
            try {
                if (replacer.length === 1) return replacer(value);
            } catch (e) {}
            return replacer(key, value);
        }

        return value;
    }, space);
}

const Protocol = new ProtocolValidator('1.21')
await Protocol.init()

const world = new World('1.21.50', {ProtocolValidator: Protocol})
world.init(data.startGame)

const worldData = {
    name: world.metadata.name,
    seed: world.metadata.seed.world,
    dimension: world.metadata.players.spawnpoint.dimension,
}
console.log(`World Intiated with metadata: ${safeStringify(worldData, parseBigIntToString, 1)}`)

const overworld = world.getDimension(0)
overworld.addChunk({
    chunk: rawChunk,
    subchunks: rawSubs
}, 0, 0)

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
//console.log(chunk.data)
console.log(`Chunk added to world dimension with data: ${safeStringify(logs, parseBigIntToString, 1)}`)

await overworld.validateChunk(0, 0)
const PChunk = chunk.PChunk
console.log(PChunk.getSection(0).getPalette())

const PChunkData = {
    sections: PChunk.maxCY,
    entities: PChunk.entities.length,
    blockAt0: PChunk.getBlock(V3(0, 0, 0)),
    blockAt1: PChunk.getBlock(1, 0, 1),
    blockAt2: PChunk.getBlock(2, 0, 2),
    blockAt3: PChunk.getBlock(3, 0, 3),
}

//console.log(`Chunk validated, prismarine chunk data: ${safeStringify(PChunkData, parseBigIntToString, 1)}`)

chunk.toRaw()
console.log(`Chunk data after toRaw call: ${safeStringify({
    hasChunk: chunk.hasChunk,
    hasSubChunks: chunk.hasSubChunks,
    isRaw: chunk.isRaw
}, parseBigIntToString, 1)}`)

console.log('Test completed successfuly')