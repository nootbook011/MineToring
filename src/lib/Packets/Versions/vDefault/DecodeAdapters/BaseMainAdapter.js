import { BaseChunkAdapter } from './BaseChunkAdapter.js'

/**
 * The primary adapter class that bridges MineToring with external decoding libraries.
 * It allows the core to work with various decoding engines without being restricted to the default Prismarine-chunk.
 */
export class BaseAdapter {
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