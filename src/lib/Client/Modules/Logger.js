import fs from 'fs'
import path from 'path'

import { generateTimestamp } from '#extra/extraFunctions'

export class Logger {
    static name = 'logger'
    static LEVELS = Object.freeze({
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    })

    level = -1
    #log = null

    #timestamp = generateTimestamp()
    #logName = 'logFile'
    #logPath = undefined
    #logFile = undefined

    #updatePath() {
        if (!this.#logPath) {
            this.#logFile = undefined
            return
        }

        this.#logFile = path.join(this.#logPath, `${this.#logName}${this.#timestamp}.log`)
    }

    get logPath() { return this.#logPath }
    set logPath(newPath) {
        this.#logPath = newPath
        this.#updatePath()
    }

    get logName() { return this.#logName }
    set logName(newName) {
        this.#logName = newName
        this.#updatePath()
    }

    get logFile() { return this.#logFile }

    constructor(level = -1, logPath = undefined, logName = 'logFile') {
        if (logPath !== undefined) this.#logPath = logPath
        if (logName !== undefined) this.#logName = logName

        this.#updatePath()
        this.level = level
    }

    #getDateTime() {
        const now = new Date()

        return now.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    }

    createLog(type, message, logLevel = -1) {
        this.#log = null

        const logType = type.toLowerCase()
        const resolvedLevel = logLevel === -1 ? Logger.LEVELS[logType] : logLevel
        if (this.level > resolvedLevel) return false

        const dateTime = this.#getDateTime()
        const logMessage = `[${dateTime} - ${logType.toUpperCase()}] ${message}`

        this.#log = [resolvedLevel, logMessage]
        return true
    }

    print() {
        if (!this.#log) return

        const [logLevel, logMessage] = this.#log

        switch (logLevel) {
            case Logger.LEVELS.error:
                console.error(logMessage)
                break
            case Logger.LEVELS.warn:
                console.warn(logMessage)
                break
            default:
                console.log(logMessage)
                break
        }
    }

    write() {
        if (!this.#log || !this.#logFile) return

        const logMessage = this.#log[1]
        const filePath = this.#logFile

        try {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.appendFileSync(filePath, logMessage + '\n', 'utf8')
        } catch (error) {
            console.error(`[Logger] Failed to write log file: ${error.message}`)
        }
    }
}