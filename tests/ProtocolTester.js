import { ProtocolLoader } from 'minetoring'
import { deepTypeof } from '#extra/extraFunctions'

const protocol = await ProtocolLoader.getProtocol('1.21.50')

console.log(protocol)
console.log(protocol.ActionsModule)