export function deepTypeof(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (Buffer.isBuffer(value)) return 'buffer';
    const type = typeof value;
    if (type !== 'object') return type;
    if (!value.constructor) return 'object';
    if (value.constructor.name === 'Object') return 'object';

    return value.constructor.name
}

export function arrayToSet(array, set) {
    for (const item of array) {
        set.add(item);
    }
}

export function parseLi64(parts) {
    if (parts === null || parts === undefined) return 0n
    if (!Array.isArray(parts) || parts.length !== 2) return BigInt(parts)

    const high = BigInt(parts[0])
    const low = BigInt(parts[1])
    const result = (high << 32n) | ((low) & 0xFFFFFFFFn)

    return BigInt.asIntN(64, result)
}

export function parseLu64(parts) {
    if (parts === null || parts === undefined) return 0n
    if (!Array.isArray(parts) || parts.length !== 2) return BigInt(parts)

    const high = BigInt(parts[0])
    const low = BigInt(parts[1])
    const result = (high << 32n) | (low & 0xFFFFFFFFn)

    return BigInt.asUintN(64, result)
}

export function BigIntToLu64(bigInt) {
    const b = BigInt(bigInt)
    const low = Number(b & 0xFFFFFFFFn)
    const high = Number((b >> 32n) & 0xFFFFFFFFn)
    return [low, high]
}

export function decodeCommand(bufferData) {
    const buf = Buffer.from(bufferData);

    const length = buf[2];
    const start = 3;
    const end = start + length;

    const command = buf.toString('utf8', start, end);

    return command;
}

export function setGetter(target, name, callback) {
    Object.defineProperty(target, name, {
        get: callback
    })
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '.')
}

export function getPercent(total, part) {
    if (total === 0) return 0
    return (part / total) * 100
}

export function deepCopy(path = {}) {
    return walk(path, { type: 'obj', fn: (_, val) => val })
}

export function createReadOnlyProxy(target) {
    return new Proxy(target, {
        get: (obj, prop) => {
            const value = Reflect.get(obj, prop);
            if (typeof value === 'object' && value !== null) {
                return createReadOnlyProxy(value);
            }
            return value;
        },
        set: () => {
            return false;
        }
    });
}

export function hasTrueValue(obj) {
    if (obj === null || typeof obj !== 'object') {
        return !!obj
    }

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (hasTrueValue(obj[key])) {
                return true;
            }
        }
    }

    return false;
}

export function safeUpdate(target, source, checker, options = { safeTypes: true }) {
    for (const key in source) {
        let sourceVal = source[key]
        const checkVal = checker[key]
        const sourceT = deepTypeof(sourceVal)
        const checkT = deepTypeof(checkVal)
        if (!(key in checker)) {
            throw new SyntaxError(`Key "${key}" is not a part of this object, please check reference!`);
        }
        if (options?.safeTypes && checkT !== sourceT) {
            const isSourceArray = sourceT === "array"
            const isCheckBuffer = checkT === "buffer" || checkT === "Uint8Array"

            if (isCheckBuffer) {
                if (isSourceArray || sourceT === 'buffer' || sourceT === 'Uint8Array') {
                    sourceVal = checkVal.constructor.from(sourceVal)
                } else {
                    throw new TypeError(`${key} = ${sourceT}, when reference key expected ${checkT}`);
                }
            } else {
                throw new TypeError(`${key} = ${sourceT}, when reference key expected ${checkT}`);
            }
        }

        if (sourceT === 'object') {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {}
            }
            safeUpdate(target[key], sourceVal, checkVal)
            continue
        }
        else target[key] = sourceVal
    }
}

function transform(arr) {
    const result = (BigInt(arr[0]) << 32n) + BigInt(arr[1]) - 1n;
    return result;
}

export function recurseUpdate(target, source, update = false) {
    for (const key in source) {
        const value = source[key]

        if (!!value && value.constructor === Object) {
            if (!(target[key]?.constructor === Object)) target[key] = {}
            const targetObject = target[key]
            recurseUpdate(targetObject, value, update)
            continue
        }
        if (update && value === undefined || value === null) continue 

        target[key] = value
    }
}

export function walk(obj, callback) {
    const { type = 'obj', fn } = callback
    const result = (type === 'map') ? new Map() : {};
    const objEntries = obj instanceof Map ? obj.entries() : Object.entries(obj)

    for (const [key, value] of objEntries) {
        const isNested = typeof value === 'object' &&
            value !== null &&
            !Buffer.isBuffer(value) &&
            !Array.isArray(value);

        const processedValue = isNested
            ? walk(value, callback)
            : fn(key, value, obj);

        if (type === 'map') {
            result.set(key, processedValue);
        } else {
            result[key] = processedValue;
        }
    }
    return result;
}

/**
 * 
 * @param {string} version 
 * @param {Array} versions 
 * @returns 
 */
export function getClosestVersion(version, versions = []) {
    if (!version) return
    if (versions[version]) return version
    if (versions.length === 0) return undefined

    const targetParts = version.split('.').map(Number)
    let closestVersion

    let minDiff = new Array(targetParts.length).fill(Infinity)

    for (const currVer of versions) {
        const parts = currVer.split('.').map(Number)
        if (!parts) continue
        let isBetter = true
        const diffs = []

        for (let i = 0; i < targetParts.length; i++) {
            const part = parts[i] ?? 0
            const target = targetParts[i]
            if (part > target) {
                isBetter = false
                break
            }

            const diff = target - part

            if (diff < minDiff[i]) {
                isBetter = true
                for (let j = diffs.length; j < i; j++) diffs[j] = minDiff[j]
                diffs[i] = diff
                break
            } else if (diff > minDiff[i]) {
                isBetter = false
                break
            }

            diffs[i] = diff
        }

        if (isBetter) {
            minDiff = diffs
            closestVersion = currVer
        }
    }

    return closestVersion
}