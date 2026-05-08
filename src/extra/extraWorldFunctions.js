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

export function getNearV3Points(target, points) {
  if (!points || points.length === 0) return []

  return [...points].sort((a, b) => {
    const distA = Math.pow(target.x - a.x, 2) + 
                  Math.pow(target.y - a.y, 2) + 
                  Math.pow(target.z - a.z, 2)

    const distB = Math.pow(target.x - b.x, 2) + 
                  Math.pow(target.y - b.y, 2) + 
                  Math.pow(target.z - b.z, 2)

    return distA - distB
  })
}

export function getBlocksLength(from, to) {
    return (Math.abs(to.x - from.x) + 1) *
        (Math.abs(to.y - from.y) + 1) *
        (Math.abs(to.z - from.z) + 1)
}

export function V3WorldToLocal(v3) {
    return { x: v3.x & 15, y: v3.y & 15, z: v3.z & 15 }
}

export function V3ToChunk(v3) {
    return { x: Math.floor(v3.x) >> 4, y: Math.floor(v3.y) >> 4, z: Math.floor(v3.z) >> 4 }
}

export function ChunkToV3(Chunk) {
    return { x: (Chunk.x) << 4, y: (Chunk.y) << 4, z: (Chunk.z) << 4 }
}

export function toSignedIndex(byte) {
    return (byte << 24) >> 24;
}

export function calculateTotalChunks(radius) {
    const side = (radius * 2) + 1;
    return Math.pow(side, 2);
}

export function isV3(checkValue) {
    return !!checkValue && ["x", "y", "z"].every((key) => 
        Object.hasOwn(checkValue, key) && typeof checkValue[key] === 'number'
    )
}
export function V3(x, y, z) {
    return { x, y, z }
}

export function isV2(checkValue) {
    return !!checkValue && ["x", "z"].every((key) => 
        Object.hasOwn(checkValue, key) && typeof checkValue[key] === 'number'
    )}
export function V2(x, z) {
    return { x, z }
}