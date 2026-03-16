import { Protocol } from 'minetoring'
import { deepTypeof } from '#extra/extraFunctions'

const protocol = new Protocol('1.21.50')
await protocol.init()

console.log(protocol.Protocol)
console.log(deepTypeof(protocol.Protocol.DataBase)