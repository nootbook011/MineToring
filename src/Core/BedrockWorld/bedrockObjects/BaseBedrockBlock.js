export class bedrockBlock {
    states
    fillBlock = 'air'
    entityNBT

    /**
     * 
     * @param {Block} staticObject 
     */
    constructor (staticObject) {
        Object.assign(this, staticObject)
    }

    addStates(states) {
        this.states = states
    }

    addExtraLayer(extraData) {
        const { name } = extraData
        if (!name || name === 'air') return

        this.fillBlock = name
    }

    addEntityData(entityNbt) {
        this.entityNBT = entityNbt
    }
}

/**
 * @typedef {import('minecraft-data').Block} Block
 */

/**
 * @type {Block & bedrockBlock}
 */
export const BedrockBlock = bedrockBlock