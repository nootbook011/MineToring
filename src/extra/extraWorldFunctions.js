export function createBedrockDBKey(x, z, tag, subChunkY = null) {
    const key = Buffer.alloc(subChunkY !== null ? 10 : 9);
    key.writeInt32LE(x, 0);
    key.writeInt32LE(z, 4);
    key.writeUInt8(tag, 8);
    if (subChunkY !== null) {
        const yByte = (subChunkY < 0) ? (256 + subChunkY) : subChunkY;
        key.writeUInt8(yByte, 9);
    }
    return key;
}

export function V3ToChunk(v3) {
    return { x: Math.floor(v3?.x ?? 0) >> 4, y: Math.floor(v3?.y ?? 0) >> 4, z: Math.floor(v3?.z ?? 0) >> 4 }
}

export function ChunkToV3(Chunk) {
    return { x: (Chunk?.x ?? 0) << 4, y: (Chunk?.y ?? 0) << 4, z: (Chunk?.z ?? 0) << 4 }
}

export function toSignedIndex(byte) {
    return (byte << 24) >> 24;
}

export function parseBigInt(bigintAllFormat) {
    let resultSeed = bigintAllFormat
    if (Array.isArray(bigintAllFormat) && bigintAllFormat.length === 2) {
        const high = BigInt(bigintAllFormat[0]);
        const low = BigInt(bigintAllFormat[1]);
        resultSeed = (high << 32n) | (low & 0xffffffffn);
    }
    return resultSeed;
}

export function calculateTotalChunks(radius) {
    const side = (radius * 2) + 1;
    return Math.pow(side, 2);
}

export function V3(x, y, z) {
    return { x, y, z }
}

export function V2(x, z) {
    return { x, z }
}