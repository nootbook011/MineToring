import baseDB from "../vDefault/DataBase.js";

import world from './db/world.js'
import chunk from './db/chunk.js'
import subchunk from './db/subchunk.js'

export default class DataBase extends baseDB {
    static _storage = {
        'chunk': chunk,
        'subchunk': subchunk,
        'world': world,
    }

    static keys = {
        chunk: 'chunk',
        subchunk: 'subchunk',
        world: 'world',
    }
}