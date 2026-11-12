import { hasData } from "./extraFunctions.js";

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

const toZigZag = (v) => {
    const val = BigInt(v)
    return (val << 1n) ^ (val >> 63n)
}

const fromZigZag = (v) => {
    const val = BigInt(v)
    return (val >> 1n) ^ (-(val & 1n))
}

export function packChunkV3(x, y, z) {
    return ((x & 0xF) << 8) | ((z & 0xF) << 4) | (y & 0xF)
}

export function unpackChunkV3(packed) {
    return [ (packed >> 8) & 0xF, packed & 0xF, (packed >> 4) & 0xF ]
}


export function packV3(x, y, z) {
    return (toZigZag(x) << 44n) | (toZigZag(y) << 22n) | toZigZag(z)
}

export function unpackV3(packed) {
    const mask = (1n << 22n) - 1n

    return V3(
        Number(fromZigZag(packed >> 44n)),
        Number(fromZigZag((packed >> 22n) & mask)),
        Number(fromZigZag(packed & mask))
    )
}

export function packV2(x, y) {
    return (toZigZag(x) << 22n) | toZigZag(y)
}

export function unpackV2(packed) {
    const mask = (1n << 22n) - 1n

    return V2(
        Number(fromZigZag(packed >> 22n)),
        Number(fromZigZag(packed & mask))
    )
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

export function froundV3(v3) {
    const { x, y, z } = v3
    return { x: Math.fround(x), y: Math.fround(y), z: Math.fround(z) }
}

export function roundV3(x, y, z) {
    return { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) }
}

export function roundV2(x, z) {
    return { x: Math.floor(x), z: Math.floor(z) }
}

export function getBlocksLength(from, to) {
    return (Math.abs(to.x - from.x) + 1) *
        (Math.abs(to.y - from.y) + 1) *
        (Math.abs(to.z - from.z) + 1)
}

export function V3WorldToLocal(x, y, z) {
    return { x: x & 15, y: y & 15, z: z & 15 }
}

export function V3ToChunk(x, y, z) {
    return { x: x >> 4, y: y >> 4, z: z >> 4 }
}

export function ChunkToV3(x, y, z) {
    return { x: x << 4, y: y << 4, z: z << 4 }
}

export function calculateTotalChunks(radius) {
    const side = (radius * 2) + 1;
    return Math.pow(side, 2);
}

export function isV3(checkValue) {
    if (typeof checkValue !== 'object' || !hasData(checkValue)) return false
    if (!Number.isFinite(checkValue.x) || !Number.isFinite(checkValue.y) || !Number.isFinite(checkValue.z)) return false
    for (const key in checkValue) { if (key !== 'x' && key !== 'y' && key !== 'z') return false }
    return true
}
export function V3(x, y, z) {
    return { x, y, z }
}

export function isV2(checkValue) {
    if (typeof checkValue !== 'object' || !hasData(checkValue)) return false
    if (!Number.isFinite(checkValue.x) || !Number.isFinite(checkValue.z)) return false
    for (const key in checkValue) { if (key !== 'x' && key !== 'z') return false }
    return true
}
export function V2(x, z) {
    return { x, z }
}

export function updateV3(v3, x, y, z) {
    let changed = false
    if (Number.isFinite(x) && x !== v3.x) { v3.x = x; changed = true }
    if (Number.isFinite(y) && y !== v3.y) { v3.y = y; changed = true }
    if (Number.isFinite(z) && z !== v3.z) { v3.z = z; changed = true }
    return changed
}

export function convertBedrockId(id) {
    const OFFSET = 1n << 63n
    if (id < 0n) {
        const k = id + OFFSET
        return -(2n * k + 1n)
    } else {
        const k = OFFSET - id
        return -(2n * k)
    }
}