import { V3, isV3 } from '#extra/extraWorldFunctions'

export class BedrockPhysicsManager {
    name = 'physics'
    #location
    #physics
    #collision
    #flags

    constructor(entity, flags = {}) {
        entity.physics = this

        Object.defineProperties(entity, {
            position: {
                get: () => this.position,
                set: (v) => { this.position = v }
            },
            rotation: {
                get: () => this.rotation
            }
        })

        this.#location = {
            position: V3(0, 0, 0),
            rotation: {
                pitch: 0,
                yaw: {
                    all: 0,
                    body: 0,
                    head: 0
                },
            }
        }

        this.#physics = {
            velocity: V3(0, 0, 0),
        }

        this.#collision = {
            scale: 0,
            hitbox: {},
            boundingbox: {
                width: 0,
                height: 0,
            },
        }

        this.#flags = flags
    }

    get collision() {
        return this.#collision
    }

    get position() {
        return this.#location.position
    }

    set position(v3) {
        if (!isV3(v3)) return
        this.#location.position = v3
    }

    /**
     * 
     * @param {number} pitch 
     * @param {{all: number, body: number, head: number}} yaw 
     */
    setRotation(pitch = undefined, yaw = {}) {
        const rotation = this.#location.rotation
        if (pitch) rotation.pitch = pitch
        if (yaw) {
            const { all, head, body } = yaw
            if (all) rotation.yaw.all = all
            if (head) rotation.yaw.head = head
            if (body) rotation.yaw.body = body
        }
    }

    get rotation() {
        return this.#location.rotation
    }

    get physics() {
        return this.#physics
    }

    get flags() {
        return this.#flags
    }
}