import { V2, V3 } from "#extra/extraWorldFunctions"
import { inputFlags as flags } from "../PhysicsModule.js";
import { AABB } from "./aabb.js"

/*
* thanks prismarine-physics library for code reference 
*/

const gravity = 0.08
const airDrag = 0.98
const FallSpeedLimit = -3.92
const jumpMomentum = 0.42
const playerSpeed = 0.1
const sprintSpeed = 1.3
const sprintSpeedInAir = 0.3
const sneakSpeed = 0.3
const airborneInertia = 0.91
const airborneAcceleration = 0.02
const negligeableVelocity = 0.003

const blockSlipperiness = 0.6

const eyeHeight = 1.62
const topHeight = 1.8
const w = 0.3

function getPhysicsYaxis(y) { return y - eyeHeight }
function getProtocolYaxis(y) { return y + eyeHeight }

function getBlockPosFromPlayer(v3) {
    return V3(Math.trunc(v3.x), Math.trunc(getPhysicsYaxis(v3.y)), Math.trunc(v3.z))
}

export class BedrockPhysicsEngine {
    /** @type {import('#lib/Client/BedrockBot').BedrockBot} */
    bot
    inertia = 0.0
    accel = 0.0

    constructor(bot) {
        this.bot = bot
    }

    PlayerTeleportHandler() {
        const player = this.bot.player
        player.velocity = V3(0, 0, 0)
    }

    getSurroundingBBs(queryBB, dimension) {
        const surroundingBBs = []
        const minX = Math.floor(queryBB.minX), maxX = Math.floor(queryBB.maxX)
        const minY = Math.floor(queryBB.minY) - 1, maxY = Math.floor(queryBB.maxY) + 1
        const minZ = Math.floor(queryBB.minZ), maxZ = Math.floor(queryBB.maxZ)

        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                for (let x = minX; x <= maxX; x++) {
                    try {
                        const blockId = dimension.getBlockId(x, y, z)
                        const meta = this.bot.registry.blocksByRuntimeId[blockId]
                        if (!meta?.id) continue

                        const rawShapes = (meta.stateIndex > 1 && meta.stateShapes[meta.stateIndex - 1]) 
                            ? meta.stateShapes[meta.stateIndex - 1] 
                            : meta.shapes

                        for (const shape of rawShapes) {
                            const blockBB = AABB.fromBedrock(...shape).offset(x, y, z)
                            surroundingBBs.push(blockBB)
                        }
                    } catch (e) { }
                }
            }
        }
        return surroundingBBs
    }

    simulatePlayer() {
        const player = this.bot.player
        player.velocity ??= V3(0, 0, 0)
        player.delta ??= V3(0, 0, 0)
        player.onGround ??= false

        this.inertia = 0.0
        this.accel = 0.0

        this.#applyInputAcceleration()
        this.#simulateCollision()
        this.#simulateGravity()

        this.#adjustPhysics()

        player.delta.x = player.velocity.x
        player.delta.z = player.velocity.z
    }

    #simulateGravity() {
        const { player } = this.bot

        player.velocity.y -= gravity
        player.velocity.y *= airDrag
        if (player.velocity.y < FallSpeedLimit) player.velocity.y = FallSpeedLimit

        player.delta.y = player.velocity.y
    }

    #applyInputAcceleration() {
        const { player, moveController: mc } = this.bot
        const dimension = this.bot.world.getDimension(player?.dimension)

        let forward = (mc.forward ? 1 : 0) - (mc.back ? 1 : 0)
        let strafe = (mc.left ? 1 : 0) - (mc.right ? 1 : 0)

        if (player.onGround) {
            const blockPos = getBlockPosFromPlayer(player.position)
            const blockUnder = dimension.getBlock(blockPos.x, blockPos.y - 1, blockPos.z)

            let playerMovement = playerSpeed
            if (mc.sneak) playerMovement = playerMovement * sneakSpeed
            else if (mc.sprint && mc.forward) playerMovement = playerMovement * sprintSpeed

            this.inertia = blockSlipperiness * airborneInertia
            this.accel = playerMovement * (0.1627714 / (this.inertia * this.inertia * this.inertia))
        } else {
            this.inertia = airborneInertia
            this.accel = airborneAcceleration

            if (mc.sprint) this.accel += airborneAcceleration * sprintSpeedInAir
        }

        if (forward !== 0 || strafe !== 0) {
            const len = Math.hypot(forward, strafe)
            forward = (forward / len) * airDrag
            strafe = (strafe / len) * airDrag

            const yawRad = player.yaw * (Math.PI / 180)

            player.velocity.x += (strafe * Math.cos(yawRad) - forward * Math.sin(yawRad)) * this.accel
            player.velocity.z += (forward * Math.cos(yawRad) + strafe * Math.sin(yawRad)) * this.accel
        }

        if (mc.jump && player.onGround) {
            if (player.jumpcd) player.jumpcd--
            else {
                player.velocity.y = jumpMomentum

                if (mc.sprint) {
                    const yawRad = player.yaw * (Math.PI / 180)
                    player.velocity.x -= Math.sin(yawRad) * 0.2
                    player.velocity.z += Math.cos(yawRad) * 0.2
                }

                player.onGround = false
                flags.start_jumping = true
                flags.jumping = true
                flags.jump_down = true
                player.jumpcd = 2
            }
        }
    }

    #adjustPhysics() {
        const { player } = this.bot

        player.velocity.x *= this.inertia
        player.velocity.z *= this.inertia

        if (Math.abs(player.velocity.x) < negligeableVelocity) player.velocity.x = 0
        if (Math.abs(player.velocity.y) < negligeableVelocity) player.velocity.y = 0
        if (Math.abs(player.velocity.z) < negligeableVelocity) player.velocity.z = 0
    }

    #simulateCollision() {
        const { player } = this.bot
        const dimension = this.bot.world.getDimension(player?.dimension)

        const maxvelocity = Math.max(Math.abs(player.velocity.x), Math.abs(player.velocity.y), Math.abs(player.velocity.z))
        const steps = Math.max(1, Math.ceil(maxvelocity / 0.25))

        const subX = player.velocity.x / steps
        const subY = player.velocity.y / steps
        const subZ = player.velocity.z / steps

        let horizontalHit = false
        let verticalHit = false

        for (let step = 0; step < steps; step++) {
            let botAABB = new AABB(-w, 0, -w, w, topHeight, w).offset(
                player.position.x,
                getPhysicsYaxis(player.position.y),
                player.position.z
            )

            // --- Y Axis ---
            if(subY) {
                let nextSubY = subY
                let queryY = botAABB.clone().extend(0, nextSubY, 0)
                for (const blockBB of this.getSurroundingBBs(queryY, dimension)) {
                    nextSubY = blockBB.computeOffsetY(botAABB, nextSubY)
                }
                botAABB.offset(0, nextSubY, 0)
                player.position.y = getProtocolYaxis(botAABB.minY)
    
                if (nextSubY !== subY) {
                    if (nextSubY == 0 && subY < 0) {
                        player.onGround = true
                        if (flags.jumping) {
                            flags.jumping = false
                            flags.jump_down = false
                        }
                    }
    
                    player.velocity.y = 0
                    verticalHit = true
                } else {
                    player.onGround = (subY === 0 && player.onGround)
                }
            }

            // --- X Axis ---
            if(subX) {
                let nextSubX = subX
                let queryX = botAABB.clone().extend(nextSubX, 0, 0)
                for (const blockBB of this.getSurroundingBBs(queryX, dimension)) {
                    nextSubX = blockBB.computeOffsetX(botAABB, nextSubX)
                }
                botAABB.offset(nextSubX, 0, 0)
                player.position.x = (botAABB.minX + botAABB.maxX) / 2
    
                if (nextSubX !== subX) {
                    player.velocity.x = 0
                    horizontalHit = true
                }
            }

            // --- Z Axis ---
            if(subZ) {
                let nextSubZ = subZ
                let queryZ = botAABB.clone().extend(0, 0, nextSubZ)
                for (const blockBB of this.getSurroundingBBs(queryZ, dimension)) {
                    nextSubZ = blockBB.computeOffsetZ(botAABB, nextSubZ)
                }
                botAABB.offset(0, 0, nextSubZ)
                player.position.z = (botAABB.minZ + botAABB.maxZ) / 2
    
                if (nextSubZ !== subZ) {
                    player.velocity.z = 0
                    horizontalHit = true
                }
            }
        }

        flags.horizontal_collision = horizontalHit
        flags.vertical_collision = verticalHit
    }
}