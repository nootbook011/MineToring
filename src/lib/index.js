import { BedrockWorld } from '#World/BaseBedrockWorld'
import { BedrockDimension } from '#World/BaseBedrockDimension'
import { BedrockEntity } from '#World/bedrockObjects/BaseBedrockEntity'
import { BedrockPlayer } from '#World/bedrockObjects/BaseBedrockPlayer'

import { BaseBedrockBot } from '#Client/BaseBedrockBot'
import { BedrockBot } from './Modify/BedrockBot.js'
import { BotOptionsManager } from '#Client/Options/BotOptionsManager'
import { ProtocolLoader } from './Protocol/ProtocolLoader.js'
import { BasePlugin } from '#Storage/moduleBase'

import { BedrockServer } from '#Server/BaseBedrockServer'

export {
    BedrockWorld as World,
    BedrockDimension as Dimension,
    BedrockEntity as Entity,
    BedrockPlayer as Player,
    BedrockBot as Bot,
    BaseBedrockBot as BaseBot,
    BedrockServer as Server,
    BotOptionsManager as BotOptions,
    BasePlugin,
    ProtocolLoader,
}