import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { BedrockBot } from '#Client/BedrockBot'
import { getBedrockCore } from './BedrockCoreManager.js'
import { BotOptionsManager } from '#Client/Options/BotOptionsManager'
import { BasePlugin } from '#Storage/moduleBase'

export {
    BedrockBot as Bot,
    BaseBedrockBot as BaseBot,
    BotOptionsManager as BotOptions,
    BasePlugin,
    getBedrockCore,
}