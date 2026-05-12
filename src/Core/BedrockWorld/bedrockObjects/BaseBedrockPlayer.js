import { recurseUpdate } from "#extra/extraFunctions";
import { BedrockEntity } from "./BaseBedrockEntity.js";

/**
 * @extends {BedrockEntity<{ username: string, uuid: string, gamemode: number, id: { unique: bigint, runtime: bigint }}>}
 */
export class BedrockPlayer extends BedrockEntity {
    constructor(metadata = undefined, states = undefined) {
        super({
            username: '',
            uuid: '',
            gamemode: 0,
            id: {
                unique: 0n,
                runtime: 0n,
            },
        }, states)
        if (metadata) this.setMetadata(metadata)
    }

    #abilities = {}
    get abilities() { return this.#abilities }

    setAbilities(abilitiesInput) {
        recurseUpdate(this.#abilities, abilitiesInput)
    }
}