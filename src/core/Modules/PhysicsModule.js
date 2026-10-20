import { SubChunkOutOfDimension } from "#extra/errors";
import { BOTSTATES } from "#extra/extraConstants";
import { froundV3 } from "#extra/extraFunctions";
import { V2, V3, V3ToChunk } from "#extra/extraWorldFunctions";
import { BaseModule } from "#Storage/moduleBase";
import { BedrockPhysicsEngine } from "./Physics/PhysicsEngine.js";

export const inputFlags = {
    ascend: false, descend: false, north_jump: false, jump_down: false,
    sprint_down: false, change_height: false, jumping: false,
    auto_jumping_in_water: false, sneaking: false, sneak_down: false,
    up: false, down: false, left: false, right: false,
    up_left: false, up_right: false, want_up: false, want_down: false,
    want_down_slow: false, want_up_slow: false, sprinting: false,
    ascend_block: false, descend_block: false, sneak_toggle_down: false,
    persist_sneak: false, start_sprinting: false, stop_sprinting: false,
    start_sneaking: false, stop_sneaking: false, start_swimming: false,
    stop_swimming: false, start_jumping: false, start_gliding: false,
    stop_gliding: false, item_interact: false, block_action: false,
    item_stack_request: false, handled_teleport: false, emoting: false,
    missed_swing: false, start_crawling: false, stop_crawling: false,
    start_flying: false, stop_flying: false, received_server_data: false,
    client_predicted_vehicle: false, paddling_left: false, paddling_right: false,
    block_breaking_delay_enabled: true, horizontal_collision: false,
    vertical_collision: false, down_left: false, down_right: false,
    start_using_item: false, camera_relative_movement_enabled: false,
    rot_controlled_by_move_direction: false, start_spin_attack: false,
    stop_spin_attack: false, hotbar_only_touch: false, jump_released_raw: false,
    jump_pressed_raw: false, jump_current_raw: false, sneak_released_raw: false,
    sneak_pressed_raw: false, sneak_current_raw: false,
}
export const inputFlagsList = Object.keys(inputFlags)

export class PhysicsModule extends BaseModule {
    static name = 'physics'
    ticks = 0n
    physcis = new BedrockPhysicsEngine(this.bot)

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
        let subChunk

        try {
            subChunk = !!dimension.getSubChunk(x, y, z)
        } catch(e) {
            if (e instanceof SubChunkOutOfDimension) subChunk = true
            else throw e
        }

        return player && dimension && subChunk
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
        
        this.bot.log('physics', `Start physics on position: ${this.bot.player.position.x} ${this.bot.player.position.y} ${this.bot.player.position.z}, tick: ${this.ticks.toString()}`, 0)
    }

    #packetsUpdate() {
        this.bot.client.on('move_player', (p) => {
            const { mode } = p
            if (mode === 'teleport') {
                inputFlags.handled_teleport = true
                this.physcis.PlayerTeleportHandler()
            }
        })
    }

    #updatePhysicsTick() {
        const bot = this.bot
        const mc = this.moveController

        if (bot.player?.health && bot.player?.health <= 0) return
        if (this.bot.status == BOTSTATES.Spawned && this.isPlayerLoaded()) this.physcis.simulatePlayer(bot.player, inputFlags, this.moveController)

        this.#updateInputFlags(false)

        const move_vector = V2(0, 0)
        if (mc.forward) move_vector.z += 1
        if (mc.back) move_vector.z -= 1
        if (mc.left) move_vector.x += 1
        if (mc.right) move_vector.x -= 1

        if (move_vector.x !== 0 && move_vector.z !== 0) {
            const length = Math.sqrt(move_vector.x * move_vector.x + move_vector.z * move_vector.z)
            move_vector.x /= length
            move_vector.z /= length
        }

        const packetData = {
            pitch: bot.player.pitch,
            yaw: bot.player.yaw,
            position: bot.player.position,
            move_vector: move_vector,
            head_yaw: bot.player.yaw,
            input_data: inputFlags,
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
        //console.log(packetData)
        //console.log(packetData.position)
        //console.log(packetData.delta)

        this.#updateInputFlags(true)
    }

    #updateInputFlags(afterSend = false) {
        const mc = this.moveController

        if (afterSend) {
            if (inputFlags.handled_teleport) inputFlags.handled_teleport = false
            if (inputFlags.start_jumping) inputFlags.start_jumping = false
            if (inputFlags.start_sprinting) inputFlags.start_sprinting = false
            if (inputFlags.stop_sprinting) inputFlags.stop_sprinting = false
            if (inputFlags.start_sneaking) inputFlags.start_sneaking = false
            if (inputFlags.stop_sneaking) inputFlags.stop_sneaking = false
            return
        }

        if (mc.sprint && (mc.forward && !inputFlags.up)) inputFlags.start_sprinting = true
        if (inputFlags.sprinting && !mc.sprint) inputFlags.stop_sprinting = true
        if (mc.sneak && (mc.forward && !inputFlags.up)) inputFlags.start_sneaking = true
        if (inputFlags.sneaking && !mc.sneak) inputFlags.stop_sneaking = true
        inputFlags.up = mc.forward
        inputFlags.down = mc.back
        inputFlags.left = mc.left
        inputFlags.right = mc.right
        inputFlags.sprinting = mc.sprint
        inputFlags.sprint_down = mc.sprint
        inputFlags.sneaking = mc.sneak
        inputFlags.sneak_down = mc.sneak

        let bitmask = 0n

        for (let i = 0; i < inputFlagsList.length; i++) {
            const key = inputFlagsList[i]
            if (inputFlags[key]) bitmask |= (1n << BigInt(i))
        }

        inputFlags._value = bitmask
    }
}