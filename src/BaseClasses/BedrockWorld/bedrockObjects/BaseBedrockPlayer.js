import { recurseUpdate } from "#extra/extraFunctions";
import { BedrockEntity } from "./BaseBedrockEntity.js";

export class BedrockPlayer extends BedrockEntity {
    #abilities = {}
    get abilities() { return this.#abilities }

    setAbilities(abilitiesInput) {
        recurseUpdate(this.#abilities, abilitiesInput)
    }
}