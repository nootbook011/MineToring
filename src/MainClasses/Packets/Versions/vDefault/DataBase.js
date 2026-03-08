export default class DataBase {
    static _storage = {}
    static keys = {}

    static getMetadata(key) {
        return structuredClone(this._storage[key])
    }
}