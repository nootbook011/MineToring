import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { BedrockRegistry } from "minetoring/core/Storage/BedrockRegistry"

describe('Bedrock Registry', () => {
    const TESTED_VERSION = '1.21.50'
    const STARTGAME_PACKET = {
        block_network_ids_are_hashes: true,
        itemstates: [
            {
                name: "minecraft:dirt",
                runtime_id: 3,
                component_based: false
            },
            {
                name: "minecraft:coal",
                runtime_id: 326,
                component_based: true
            }
        ]
    }

    let registry

    beforeEach(() => {
        registry = new BedrockRegistry(TESTED_VERSION)
    })

    it('Initialization for 1.21.50 version', () => {
        assert.equal(registry.blocks?.[0]?.name, 'air', 'Data from Minecraft-data was not loaded.')
        assert.equal(registry.version?.version, 766, 'Version does not match the expected.')
    })

    it('StartGame handle', (t) => {
        registry.handleStartGame(STARTGAME_PACKET)

        const itemDirtId = 28

        const blockStoneHashedId = -2144268767
        const blockStoneId = 2403

        assert.equal(registry.items[itemDirtId]?.name, 'dirt', 'Items not loadded.')
        assert.equal(registry.itemsByRuntimeId[3]?.name, 'dirt', 'ItemsRuntimeId not loadded.')

        let stoneBlock
        if (STARTGAME_PACKET.block_network_ids_are_hashes) stoneBlock = registry.blocksByRuntimeId[blockStoneHashedId]
        else stoneBlock = registry.blocksByRuntimeId[blockStoneId]

        assert.equal(stoneBlock?.name, 'stone', `Mismatch with Blocks in BlocksByRuntimeId register. blocksIdsHashed = ${STARTGAME_PACKET.block_network_ids_are_hashes}`)

        const loadItemsSpy = t.mock.method(registry, 'loadItemStates')

        registry.handleStartGame()

        assert.equal(loadItemsSpy.mock.callCount(), 0, 'StartGame Packet can be handled twice.')
    })
})