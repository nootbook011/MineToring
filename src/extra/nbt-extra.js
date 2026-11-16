export function equalNbt(a, b) {
    if (isNode(a) && isNode(b)) {
        if (a.type !== b.type) return false

        switch (a.type) {
            case 'compound': {
                const ak = Object.keys(a.value)
                const bk = Object.keys(b.value)
                if (ak.length !== bk.length) return false
                for (const k of ak) {
                    if (!(k in b.value)) return false
                    if (!equalNbt(a.value[k], b.value[k])) return false
                }
                return true
            }

            case 'list': {
                const at = a.value.type
                const bt = b.value.type
                if (at !== bt) return false
                const av = a.value.value
                const bv = b.value.value
                if (av.length !== bv.length) return false
                for (let i = 0; i < av.length; i++) {
                    if (!equalNbt({ type: at, value: av[i] }, { type: bt, value: bv[i] })) return false
                }
                return true
            }

            case 'byteArray':
                return Buffer.isBuffer(a.value) && Buffer.isBuffer(b.value)
                    ? a.value.equals(b.value)
                    : arrayEquals(a.value, b.value)

            case 'intArray':
            case 'shortArray':
                return arrayEquals(a.value, b.value)

            case 'longArray': {
                if (a.value.length !== b.value.length) return false
                for (let i = 0; i < a.value.length; i++) {
                    if (!longEquals(a.value[i], b.value[i])) return false
                }
                return true
            }

            case 'long':
                return longEquals(a.value, b.value)

            case 'float':
            case 'double':
                return a.value == b.value

            default:
                return primitiveEquals(a.value, b.value)
        }
    }

    if (isNode(a) || isNode(b)) {
        return equalNbt(toValue(a), toValue(b))
    }

    if (Array.isArray(a) && Array.isArray(b)) return arrayEquals(a, b)
    if (typeof a === 'bigint' || typeof b === 'bigint') return longEquals(a, b)
    if (typeof a === 'number' && typeof b === 'number') return a == b
    return a === b
}

export function nbtToObject(node) {
    if (!node || typeof node !== 'object') return node

    const { type, value } = node

    switch (type) {
        case 'compound': {
            const out = {}
            for (const key of Object.keys(value)) out[key] = nbtToObject(value[key])
            return out
        }

        case 'list': {
            const { type: elemType, value: arr } = value
            return arr.map(v => convert({ type: elemType, value: v }))
        }

        case 'byteArray':
        case 'intArray':
        case 'shortArray':
        case 'longArray':
        case 'string':
        case 'byte':
        case 'short':
        case 'int':
        case 'long':
        case 'float':
        case 'double':
        case 'bool':
            return value

        default:
            throw new Error(`nbtToObject: unknown type "${type}"`)
    }
}

function isNode(v) {
    return v && typeof v === 'object' && !Array.isArray(v) && typeof v.type === 'string' && 'value' in v
}

function toValue(v) {
    if (isNode(v)) {
        if (v.type === 'long') return v.value
        if (v.type === 'list') return v.value.value
        return v.value
    }
    return v
}

function arrayEquals(a, b) {
    if (!a || !b || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
}

function longEquals(a, b) {
    if (typeof a === 'bigint' && typeof b === 'bigint') return a === b

    const A = asBigInt(a)
    const B = asBigInt(b)
    if (A === null || B === null) return a === b
    return A === B
}

function asBigInt(v) {
    if (typeof v === 'bigint') return v
    if (typeof v === 'number' && Number.isFinite(v)) return BigInt(v)
    if (Array.isArray(v) && v.length === 2) {
        const hi = BigInt.asIntN(32, BigInt(v[0]))
        const lo = BigInt.asUintN(32, BigInt(v[1]))
        return (hi << 32n) | lo
    }
    return null
}

function primitiveEquals(a, b) {
    if (typeof a === 'bigint' || typeof b === 'bigint') return longEquals(a, b)
    return a === b
}