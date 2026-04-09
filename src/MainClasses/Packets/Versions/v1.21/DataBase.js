import baseDB from "../vDefault/DataBase.js";

import world from './Parsers/world.js'
import chunk from './Parsers/chunk.js'
import subchunk from './Parsers/subсhunk.js'
import entity from "./Parsers/entity.js";

export default class DataBase extends baseDB {
    static _storage = {
        'chunk': chunk,
        'subchunk': subchunk,
        'world': world,
        'entity': entity
    }

    static keys = {
        chunk: 'chunk',
        subchunk: 'subchunk',
        world: 'world',
        entity: 'entity'
    }
}