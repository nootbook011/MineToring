import { froundV3 } from "#extra/extraFunctions";
import { V2, V3 } from "#extra/extraWorldFunctions"
import { inputFlags as flags } from "../PhysicsModule.js";
import { AABB } from "./aabb.js"

/*
* thanks prismarine-physics library for code reference
*/

const gravity = 0.08
const airDrag = 0.98
const airborneInertia = 0.91
const airborneAcceleration = 0.02
const negligeableVelocity = 0.003
const FallSpeedLimit = -3.92

const playerSpeed = 0.1
const sprintSpeed = 1.3
const sprintSpeedInAir = 0.3
const sneakSpeed = 0.3
const jumpMomentum = 0.42
const stepHeight = 0.6

const blockSlipperiness = 0.6

const playerEyeHeight = 1.62
const playerTopHight = 1.8
const playerHalfWidth = 0.3

function getPhysicsYaxis(y) { return y - playerEyeHeight }
function getProtocolYaxis(y) { return y + playerEyeHeight }

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

                        const rawShapes = (meta.stateId !== meta.defaultState && meta.stateShapes[meta.stateId - meta.minStateId])
                            ? meta.stateShapes[meta.stateId - meta.minStateId]
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

    getPlayerBB() {
        const w = playerHalfWidth
        const h = playerTopHight
        const { x, y, z } = this.bot.player.position

        return new AABB(-w, 0, -w, w, h, w).offset(x, getPhysicsYaxis(y), z)
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
            //const blockPos = getBlockPosFromPlayer(player.position)
            //const blockUnder = dimension.getBlock(blockPos.x, blockPos.y - 1, blockPos.z)

            let playerMovement = playerSpeed
            if (mc.sneak) playerMovement = playerMovement * sneakSpeed
            else if (mc.sprint) playerMovement = playerMovement * sprintSpeed

            this.inertia = blockSlipperiness * airborneInertia
            this.accel = playerMovement * (0.16277136 / (this.inertia * this.inertia * this.inertia))
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

        const { x: dx, y: dy, z: dz } = player.velocity
        let nextDX = dx
        let nextDY = dy
        let nextDZ = dz

        let horizontalHit = false
        let verticalHit = false

        let playerBB = this.getPlayerBB()
        const queryBB = playerBB.clone().extend(dx, dy, dz)
        const surroundingBBs = this.getSurroundingBBs(queryBB, dimension)
        const oldBB = playerBB.clone()

        // --- Y Axis ---
        if (dy) {
            for (const blockBB of surroundingBBs) {
                nextDY = blockBB.computeOffsetY(playerBB, nextDY)
            }
            playerBB.offset(0, nextDY, 0)

            if (nextDY !== dy) {
                if (nextDY == 0 && dy < 0) {
                    player.onGround = true
                    if (flags.jumping) {
                        flags.jumping = false
                        flags.jump_down = false
                    }
                }

                verticalHit = true
            } else {
                player.onGround = (dy == 0 && player.onGround)
            }
        }

        // --- X Axis ---
        if (dx) {
            for (const blockBB of surroundingBBs) {
                nextDX = blockBB.computeOffsetX(playerBB, nextDX)
            }
            playerBB.offset(nextDX, 0, 0)

            if (nextDX !== dx) horizontalHit = true
        }

        // --- Z Axis ---
        if (dz) {
            for (const blockBB of surroundingBBs) {
                nextDZ = blockBB.computeOffsetZ(playerBB, nextDZ)
            }
            playerBB.offset(0, 0, nextDZ)

            if (nextDZ !== dz) horizontalHit = true
        }

        // --- Step on block ---
        if (player.onGround && horizontalHit) {
            const oldVelXCol = nextDX
            const oldVelYCol = nextDY
            const oldVelZCol = nextDZ
            const oldBBCol = playerBB.clone()

            nextDY = stepHeight
            const queryBB = oldBB.clone().extend(dx, nextDY, dz)
            const surroundingBBs = this.getSurroundingBBs(queryBB, dimension)

            const BB1 = oldBB.clone()
            const BB2 = oldBB.clone()
            const BB_XZ = BB1.clone().extend(nextDX, 0, nextDZ)

            let dy1 = nextDY
            let dy2 = nextDY
            for (const blockBB of surroundingBBs) {
                dy1 = blockBB.computeOffsetY(BB_XZ, dy1)
                dy2 = blockBB.computeOffsetY(BB2, dy2)
            }
            BB1.offset(0, dy1, 0)
            BB2.offset(0, dy2, 0)

            let dx1 = dx
            let dx2 = dx
            for (const blockBB of surroundingBBs) {
                dx1 = blockBB.computeOffsetX(BB1, dx1)
                dx2 = blockBB.computeOffsetX(BB2, dx2)
            }
            BB1.offset(dx1, 0, 0)
            BB2.offset(dx2, 0, 0)

            let dz1 = dz
            let dz2 = dz
            for (const blockBB of surroundingBBs) {
                dz1 = blockBB.computeOffsetZ(BB1, dz1)
                dz2 = blockBB.computeOffsetZ(BB2, dz2)
            }
            BB1.offset(0, 0, dz1)
            BB2.offset(0, 0, dz2)

            const norm1 = dx1 * dx1 + dz1 * dz1
            const norm2 = dx2 * dx2 + dz2 * dz2

            if (norm1 > norm2) {
                nextDX = dx1
                nextDY = -dy1
                nextDZ = dz1
                playerBB = BB1
            } else {
                nextDX = dx2
                nextDY = -dy2
                nextDZ = dz2
                playerBB = BB2
            }

            for (const blockBB of surroundingBBs) {
                nextDY = blockBB.computeOffsetY(playerBB, nextDY)
            }
            playerBB.offset(0, nextDY, 0)

            if (oldVelXCol * oldVelXCol + oldVelZCol * oldVelZCol >= nextDY * nextDX + nextDZ * nextDZ) {
                nextDX = oldVelXCol
                nextDY = oldVelYCol
                nextDZ = oldVelZCol
                playerBB = oldBBCol
            }
        }

        // --- Update ---
        const { position, velocity } = player
        position.x = playerBB.minX + playerHalfWidth
        position.y = getProtocolYaxis(playerBB.minY)
        position.z = playerBB.minZ + playerHalfWidth
        
        if (dx !== nextDX) velocity.x = 0
        if (dy !== nextDY) velocity.y = 0
        if (dz !== nextDZ) velocity.z = 0

        flags.horizontal_collision = horizontalHit
        flags.vertical_collision = verticalHit
    }
}