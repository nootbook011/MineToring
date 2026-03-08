import { BaseChunkAdapter } from './BaseChunkAdapter.js'

/**
 * The primary adapter class that bridges MineToring with external decoding libraries.
 * It allows the core to work with various decoding engines without being restricted to the default Prismarine-chunk.
 */
export class BaseAdapter {
    /**
     * Configure the adapter using data from the StartGame packet.
     * Useful for setting world parameters like height or generation type during initialization.
     * @param {object} startGamePacket - The data from the StartGame packet.
     * @returns {void|undefined}
     */
    setStartgamePacket(startGamePacket) {
        return undefined
    }
    
    /**
     * Returns the adapter class responsible for chunk validation.
     * Should return a class constructor that extends BaseChunkAdapter.
     * @returns {typeof BaseChunkAdapter}
     * @readonly
     */
    get chunk() {
        return BaseChunkAdapter
    }
}