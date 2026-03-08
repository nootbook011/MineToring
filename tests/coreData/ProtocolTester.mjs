import { ProtocolValidator } from 'minetoring/MainClasses/Packets/ProtocolValidator'
import { deepTypeof } from '#extra/extraFunctions'

const ProtoValid = new ProtocolValidator('1.21.50')
await ProtoValid.init()

console.log(ProtoValid.data)
console.log(deepTypeof(new ProtoValid.Protocol.ClientPacketsHandler(0)))
console.log(deepTypeof(ProtoValid.data.Parsers.startGamePacket))