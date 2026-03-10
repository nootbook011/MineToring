export default class DataBase {
    static _storage = {}
    static keys = {}

    static getParser(key) {
        return structuredClone(this._storage[key])
    }
}