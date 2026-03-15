export default class DataBase {
    static _storage = {}
    static keys = {}

    static getParser(key) {
        return this._storage[key]
    }
}