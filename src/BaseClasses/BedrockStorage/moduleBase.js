export class BaseModule {
    _getClient

    constructor(clientGetter) {
        this._getClient = clientGetter
    }
}

export { BaseModule as BasePlugin }