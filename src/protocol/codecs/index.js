import { ByteStream } from "#Core/Storage/Binary/ByteStream"

/**
 * 
 * @param {*} payload 
 * @returns {ByteStream}
 */
export function parsePayload(payload) {
    if (!(payload?.length > 1)) return false

    let stream = payload
    if (!(payload instanceof ByteStream)) {
        if (Array.isArray(payload)) stream = Buffer.from(payload)
        stream = new ByteStream(stream)
    }

    return stream
}