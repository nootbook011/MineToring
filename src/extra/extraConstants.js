export const DIMENSIONS = {
    reverse: {
        0: "overworld",
        1: "nether",
        2: "the_end"
    },
    overworld: 0,
    nether: 1,
    the_end: 2
}

export const GAMEMODES = {
    reverse: {
        0: "survival",
        1: "creative",
        2: "adventure",
        5: "fallback",
        6: "spectator"
    },
    survival: 0,
    creative: 1,
    adventure: 2,
    fallback: 5,
    spectator: 6
}

export const PERMISSION_LEVELS = {
    reverse: {
        0: "visitor",
        1: "member",
        2: "operator",
        3: "custom",
    },
    visitor: 0,
    member: 1,
    operator: 2,
    custom: 3,
}

export const COMMAND_PERMISSION_LEVELS = {
    reverse: {
        0: "normal",
        1: "operator",
        2: "automation",
        3: "host",
        4: "owner",
        5: "internal",
    },
    normal: 0,
    operator: 1,
    automation: 2,
    host: 3,
    owner: 4,
    internal: 5,
}

export const ANIMATE_IDS = {
    reverse: {
        0: "none",
        1: "swing_arm",
        2: "unknown",
        3: "wake_up",
        4: "critical_hit",
        5: "magic_critical_hit",
        128: "row_right",
        129: "row_left"
    },
    none: 0,
    swing_arm: 1,
    unknown: 2,
    wake_up: 3,
    critical_hit: 4,
    magic_critical_hit: 5,
    row_right: 128,
    row_left: 129
}

export const BOTSTATES = {
    NotInitialized: 0,
    Disconnected: 1,
    Connecting: 2,
    Spawned: 3
}