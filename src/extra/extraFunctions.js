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
    if (!parts) return
    if (!Array.isArray(parts) || parts.length !== 2) return BigInt(parts);
    
    const low = BigInt(parts[0]);
    const high = BigInt(parts[1]);
    
    const result = (high << 32n) | (low & 0xFFFFFFFFn);
    
    return BigInt.asIntN(64, result);
}

export function parseLu64(parts) {
    if (!parts) return
    if (!Array.isArray(parts) || parts.length !== 2) return BigInt(parts);
    
    const low = BigInt(parts[0]);
    const high = BigInt(parts[1]);
    
    const result = (high << 32n) | (low & 0xFFFFFFFFn);
    
    return BigInt.asUintN(64, result);
}

export function BigIntToLu64(bigInt) {
    const low = Number(bigInt & 0xFFFFFFFFn);
    const high = Number(bigInt >> 32n);
    return [low, high];
};

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

export function safeUpdate(target, source, checker, options = {}) {
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