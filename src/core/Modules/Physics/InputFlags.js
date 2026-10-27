export const INPUT_FLAGS = Object.freeze({
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
    block_breaking_delay_enabled: false, horizontal_collision: false,
    vertical_collision: false, down_left: false, down_right: false,
    start_using_item: false, camera_relative_movement_enabled: false,
    rot_controlled_by_move_direction: false, start_spin_attack: false,
    stop_spin_attack: false, hotbar_only_touch: false, jump_released_raw: false,
    jump_pressed_raw: false, jump_current_raw: false, sneak_released_raw: false,
    sneak_pressed_raw: false, sneak_current_raw: false,
})
export const INPUT_FLAGS_LIST = Object.freeze(Object.keys(INPUT_FLAGS))
/** @type {INPUT_FLAGS} */
export const INPUT_FLAGS_NAMES = Object.freeze(Object.fromEntries(Object.keys(INPUT_FLAGS).map(k => [k, k])))

export class InputFlagsController {
    InputFlags = { ...INPUT_FLAGS }
    #onceFlags = []

    updateBitmaskValue() {
        const inputFlags = this.InputFlags
        const inputFlagsList = INPUT_FLAGS_LIST
        let bitmask = 0n

        for (let i = 0; i < inputFlagsList.length; i++) {
            const key = inputFlagsList[i]
            if (inputFlags[key]) bitmask |= (1n << BigInt(i))
        }

        inputFlags._value = bitmask
    }
    updateFlagsAfterSend() {
        for (const flag of this.#onceFlags) { this.off(flag) }
        this.#onceFlags = []
    }

    get(flag) { return this.InputFlags[flag] }
    set(flag, boolean) { this.InputFlags[flag] = Boolean(boolean) }

    on(flag) { this.InputFlags[flag] = true }
    off(flag) { this.InputFlags[flag] = false }
    switch(flag) { this.InputFlags[flag] = !this.InputFlags[flag] }
    once(flag) {
        this.on(flag)
        this.#onceFlags.push(flag)
    }

}