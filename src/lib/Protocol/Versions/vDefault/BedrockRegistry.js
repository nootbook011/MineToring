import mcData from "minecraft-data"

export default class BedrockRegistry {
    constructor(bedrockVersion) {
        const staticData = mcData(`bedrock_${bedrockVersion}`)
        if (!staticData) {
            throw new Error('Do not have data for ' + bedrockVersion)
        }
        const data = Object.assign({}, staticData)
        Object.assign(this, data)
    }
}