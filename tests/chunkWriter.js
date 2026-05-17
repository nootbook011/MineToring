import { BedrockChunk } from "#World/bedrockObjects/BaseBedrockChunk";

const chunk = new BedrockChunk()
const version = '1.21.50'
await chunk.init(version)
chunk.create(0, 0, 0)
chunk.metadata

const emptySubChunk = chunk.getSubChunk(0)
const emptyBlock = chunk.getBlock(0, 0, 0)
console.log(emptyBlock.metadata)

chunk.setBlockId(0, 100, 0, 0, 1942424059)
const block = chunk.getBlock(0, 100, 0)
console.log(block.metadata)

chunk.setBlock(block, 0, 0, 0)
const newBlock = chunk.getBlock(0,0,0)
console.log(newBlock.metadata)