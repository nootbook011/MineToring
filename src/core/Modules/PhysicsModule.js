import { BOTSTATES, GAMEMODES } from "#extra/extraConstants";
import { froundV3 } from "#extra/extraFunctions";
import { V2, V3, V3ToChunk } from "#extra/extraWorldFunctions";
import { BaseModule } from "#Storage/moduleBase";
import { INPUT_FLAGS_NAMES, InputFlagsController } from "./Physics/InputFlags.js";
import { BedrockPhysicsEngine } from "./Physics/PhysicsEngine.js";

export class PhysicsModule extends BaseModule {
    static name = 'physics'
    ticks = 0n
    inputFlagsController = new InputFlagsController()
    physcis = new BedrockPhysicsEngine(this.bot, this.inputFlagsController)

    moveController = {
        forward: false,
        back: false,
        left: false,
        right: false,
        jump: false,
        sprint: false,
        sneak: false
    }

    injector(bot) {
        bot.moveController = this.moveController
    }

    isPlayerLoaded() {
        const player = this.bot.player
        const dimension = this.bot.world.getDimension(player.dimension)
        const { x, y, z } = V3ToChunk(player.position)

        return player && dimension && (!dimension.isYInDimensionBounds(y) || !!dimension.getSubChunk(x, y, z))
    }

    #tickCounter() {
        this.ticks = 0n
        let lastPhysicsFrameTime = performance.now()
        let timeAccumulator = 0
        let catchupTicks = 0

        const PHYSICS_TIMESTEP = 1 / 20
        const PHYSICS_CATCHUP_TICKS = 10

        this.bot.client.on('tick', () => {
            const now = performance.now()
            const deltaSeconds = (now - lastPhysicsFrameTime) / 1000
            lastPhysicsFrameTime = now

            timeAccumulator += deltaSeconds
            catchupTicks = 0

            while (timeAccumulator >= PHYSICS_TIMESTEP) {
                this.bot.client.emit('physicsTick')
                timeAccumulator -= PHYSICS_TIMESTEP
                catchupTicks++
                this.ticks++

                if (catchupTicks >= PHYSICS_CATCHUP_TICKS) {
                    timeAccumulator = 0
                    break
                }
            }
        })
    }

    addPhysicsListeners() {
        this.bot.client.once('start_game', () => this.#tickCounter())
        this.bot.client.once('server_ready', () => this.startPhysics())
    }

    startPhysics() {
        this.#packetsUpdate()
        this.bot.client.on('physicsTick', () => { this.#updatePhysicsTick() })

        this.inputFlagsController.on(INPUT_FLAGS_NAMES.block_breaking_delay_enabled)
        
        this.bot.log('physics', `Start physics on position: ${this.bot.player.position.x} ${this.bot.player.position.y} ${this.bot.player.position.z}, tick: ${this.ticks.toString()}`, 0)
    }

    #packetsUpdate() {
        const flagsNames = INPUT_FLAGS_NAMES
        const flags = this.inputFlagsController

        this.bot.client.on('move_player', (p) => {
            const { mode } = p
            if (mode === 'teleport') {
                flags.once(flagsNames.handled_teleport)
                this.physcis.PlayerTeleportHandler()
            }
        })
    }

    #updatePhysicsTick() {
        const bot = this.bot

        if (bot.player?.health && bot.player?.health <= 0) return
        if (this.bot.status == BOTSTATES.Spawned && this.isPlayerLoaded()) this.physcis.simulatePlayer()
        
        const move_vector = this.#updateMoveVector()
        this.#updateInputFlags()

        const packetData = {
            pitch: bot.player.pitch,
            yaw: bot.player.yaw,
            position: bot.player.position,
            move_vector: move_vector,
            head_yaw: bot.player.yaw,
            input_data: this.inputFlagsController.InputFlags,
            input_mode: "mouse",
            play_mode: "screen",
            interaction_model: "touch",
            interact_rotation: V2(bot.player.pitch, bot.player.yaw),
            tick: this.ticks,
            delta: froundV3(this.bot.player.delta) ?? V3(0, 0, 0),
            analogue_move_vector: V2(0, 0), // Dont use
            camera_orientation: bot.player.camera,
            raw_move_vector: move_vector
        }
        bot.client.queue('player_auth_input', packetData)
        this.inputFlagsController.updateFlagsAfterSend()
    }

    #updateMoveVector() {
        const move_vector = V2(0, 0)
        const mc = this.moveController
        if (mc.forward) move_vector.z += 1
        if (mc.back) move_vector.z -= 1
        if (mc.left) move_vector.x += 1
        if (mc.right) move_vector.x -= 1

        if (move_vector.x !== 0 && move_vector.z !== 0) {
            const length = Math.sqrt(move_vector.x * move_vector.x + move_vector.z * move_vector.z)
            move_vector.x /= length
            move_vector.z /= length
        }

        return move_vector
    }

    #updateInputFlags() {
        const mc = this.moveController
        const flagsNames = INPUT_FLAGS_NAMES
        const flags = this.inputFlagsController
        const InputFlags = flags.InputFlags

        if (mc.sprint && (mc.forward && !InputFlags.up)) flags.once(flagsNames.start_sprinting)
        if (InputFlags.sprinting && !mc.sprint) flags.once(flagsNames.stop_sprinting)
        if (mc.sneak && (mc.forward && !InputFlags.up)) flags.once(flagsNames.start_sneaking)
        if (InputFlags.sneaking && !mc.sneak) flags.once(flagsNames.stop_sneaking)

        flags.set(flagsNames.up, mc.forward)
        flags.set(flagsNames.down, mc.back)
        flags.set(flagsNames.left, mc.left)
        flags.set(flagsNames.right, mc.right)
        flags.set(flagsNames.sprinting, mc.sprint)
        flags.set(flagsNames.sprint_down, mc.sprint)
        flags.set(flagsNames.sneaking, mc.sneak)
        flags.set(flagsNames.sneak_down, mc.sneak)

        flags.updateBitmaskValue()
    }
}