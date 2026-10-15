import { before, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { V2, V3 } from '#extra/extraWorldFunctions'

import { BedrockChunk } from "minetoring/core/world/objects/bedrockchunk"
import { BedrockSubChunk } from "minetoring/core/world/objects/BedrockSubChunk"
import { BedrockBlock } from "minetoring/core/world/objects/BedrockBlock"

const VERSION = '1.21.50'

describe('Bedrock World Storage Unit Tests', () => {
    let registry

    before(() => {
        const tempChunk = new BedrockChunk()
        tempChunk.init(VERSION)
        tempChunk.registry.loadHashedRuntimeIds()
        registry = tempChunk.registry
    })

    describe('BedrockBlock', () => {
        it('throws TypeError when instantiated without initializing registry', () => {
            const block = new BedrockBlock()
            assert.throws(() => block.create(1), TypeError)
        })

        it('successfully initializes and retrieves metadata by runtimeId', () => {
            const block = new BedrockBlock(registry)
            const blockStoneHashedId = -2144268767
            block.create(blockStoneHashedId)

            assert.equal(block.id, 1)
            assert.equal(block.runtimeId, blockStoneHashedId)
            assert.ok(block.metadata)
            assert.ok(block.states)
        })

        it('validates and updates block position', () => {
            const block = new BedrockBlock(registry)
            block.create(undefined, 1)

            assert.ok(block.position = V3(10, 64, -5))
            assert.deepEqual(block.position, V3(10, 64, -5))

            block.position = { x: 10 }
            assert.notDeepEqual(block.position, { x: 10 })
        })

        it('handles second layer block and block entity NBT', () => {
            const block = new BedrockBlock(registry)
            block.create(undefined, 1, 2)

            assert.equal(block.secondLayerBlockId, 2)
            assert.ok(block.secondLayerBlock)

            const testNBT = { name: { type: 'string', value: 'Chest' } }
            block.entityNBT = testNBT
            assert.deepEqual(block.entityNBT, testNBT)
        })
    })

    describe('BedrockSubChunk', () => {
        let subChunk

        beforeEach(() => {
            subChunk = new BedrockSubChunk(registry)
            subChunk.create(0, 4, 0, 0) // x=0, y=4, z=0, dim=0
        })

        it('calculates global subchunk boundaries (from / to)', () => {
            assert.deepEqual(subChunk.from, V3(0, 64, 0)) // Y = 4 * 16 = 64
            assert.deepEqual(subChunk.to, V3(15, 79, 15))
        })

        it('throws TypeError when setting an invalid PalettedStorage to a layer', () => {
            assert.throws(() => subChunk.setLayer(0, {}), TypeError)
        })

        it('writes and reads block IDs across layers', () => {
            subChunk.setBlockId(1, 2, 3, 0, 100)
            subChunk.setBlockId(1, 2, 3, 1, 200)

            assert.equal(subChunk.getBlockId(1, 2, 3, 0), 100)
            assert.equal(subChunk.getBlockId(1, 2, 3, 1), 200)
        })

        it('stores and retrieves block entity NBT by local coordinates', () => {
            const nbtData = { text: 'Hello' }
            subChunk.setBlockEntity(5, 5, 5, nbtData)

            assert.deepEqual(subChunk.getBlockEntity(5, 5, 5), nbtData)
            assert.equal(subChunk.getBlockEntity(0, 0, 0), undefined)
        })

        it('generates a BedrockBlock instance via getBlock with absolute position', () => {
            const blockStoneHashedId = -2144268767
            subChunk.setBlockId(2, 3, 4, 0, blockStoneHashedId)

            const block = subChunk.getBlock(2, 3, 4)
            assert.ok(block instanceof BedrockBlock)
            assert.equal(block.id, 1)
            assert.deepEqual(block.position, V3(2, 67, 4)) // 64 + 3 = 67
        })
    })

    describe('BedrockChunk', () => {
        let chunk

        beforeEach(() => {
            chunk = new BedrockChunk(registry)
            chunk.create(1, -1, 0)
        })

        it('sets position and validates type on assignment', () => {
            assert.deepEqual(chunk.position, V2(1, -1))
            assert.equal(chunk.dimension, 0)
            chunk.position = { x: 10 }
            assert.notDeepEqual(chunk.position, { x: 10 })
        })

        it('manages subchunks and respects dimension height limits', () => {
            assert.equal(chunk.hasSubChunks, false)

            const subChunk = chunk.createSubChunk(0)
            assert.ok(subChunk instanceof BedrockSubChunk)
            assert.equal(chunk.hasSubChunks, true)

            const invalidSubChunk = chunk.createSubChunk(999)
            assert.equal(invalidSubChunk, false)
        })

        it('validates type when setSubChunk is called', () => {
            assert.throws(() => chunk.setSubChunk(0, {}), TypeError)
        })

        it('writes, reads biomes and integrates with registry.biomes', () => {
            assert.equal(chunk.hasBiomes, false)

            chunk.setBiomeId(0, 64, 0, 1)
            assert.equal(chunk.getBiomeId(0, 64, 0), 1)
            assert.equal(chunk.getBiome(0, 64, 0)?.name, 'plains')
            assert.equal(chunk.hasBiomes, true)
        })

        it('validates type when setBiomeSection is called', () => {
            assert.throws(() => chunk.setBiomeSection(0, {}), TypeError)
        })

        it('sets and gets border block state', () => {
            assert.equal(chunk.getBorder(0, 0), false)
            chunk.setBorder(0, 0, true)
            assert.equal(chunk.getBorder(0, 0), true)
        })

        it('parses border payload packets', () => {
            // Payload: count = 2, coordinates: z=1/x=2 (0x12), z=3/x=4 (0x34)
            const payload = [0x02, 0x12, 0x34]
            assert.ok(chunk.setBorderBlocksPayload(payload))
            assert.equal(chunk.getBorder(2, 1), true)
            assert.equal(chunk.getBorder(4, 3), true)
        })
    })
})