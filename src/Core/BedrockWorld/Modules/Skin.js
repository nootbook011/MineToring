export class BedrockSkin {
    name = 'skin'
    injector(player) {
        player.skin = this
    }

    constructor (skinData = {}) {
        Object.assign(this, skinData)
    }
}