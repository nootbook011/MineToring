/**
 * Base class for adapting Bedrock chunks into a format compatible with external libraries (e.g., Prismarine-chunk).
 * This serves as an interface for creating custom network data payload decoders.
 */
export class BaseChunkAdapter {
    /**
     * Build a validated chunk instance from a BedrockChunk object.
     * @param {object} bedrockChunk - The BedrockChunk instance to process.
     * @param {object} [decodedChunk] - Optional existing decoded chunk.
     * @returns {Promise<object>} A promise that resolves to the validated chunk class based on the payload.
     * @abstract
     */
    async buildFromBedrockChunk(bedrockChunk, decodedChunk) {
        // Implementation logic for validation and data transformation
        throw new Error("Method 'buildFromBedrockChunk' must be implemented in a subclass.");
    }
    
    /**
     * Construct an object containing validated sub-chunk classes.
     * @param {object} bedrockChunk - The source BedrockChunk instance.
     * @param {object} decodedChunk - The already decoded chunk data.
     * @returns {Promise<Object.<number, object>>} An object where keys represent Y-coordinates and values are decoded sub-chunk classes.
     * @abstract
     */
    async buildFromBedrockSubChunks(bedrockChunk, decodedChunk) {
        // Logic to return an object with Y-keys and decoded sub-chunk classes
        throw new Error("Method 'buildFromBedrockSubChunks' must be implemented in a subclass.");
    }
}