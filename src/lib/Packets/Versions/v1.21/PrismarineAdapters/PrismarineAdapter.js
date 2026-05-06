import { BaseAdapter } from '#Main/Packets/Versions/vDefault/DecodeAdapters/BaseMainAdapter'

import { PrismarineVChunk } from "./PrismarineChunk.js"

export class PrismarineAdapter extends BaseAdapter {
    #storageSourceUnit
    #storageValidators = {}

    constructor(version = "1.21") {
        super()
        const storageSource = {
            registry: registry(`bedrock_${version}`),
        }

        this.#storageSourceUnit = storageSource
        this.#storageValidators = {
            chunk: new PrismarineVChunk().initValidator(storageSource),
        }
    }

    setStartgamePacket(startGamePacket) {
        const reg = this.#storageSourceUnit.registry
        reg.handleStartGame(startGamePacket)
    }

    get chunk() {
        return this.#storageValidators.chunk
    }
}