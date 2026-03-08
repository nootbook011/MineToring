import fs from 'fs'
import path from 'path'

import { generateTimestamp } from '#extra/extraFunctions'

export class Logger {

    static LEVELS = {
            'debug': 0,
            'warn': 2,
            'error': 3
        };

    constructor(level, timestamp = generateTimestamp(), logPath = '', logsName = 'logFile') {
        if (logPath) this.logFilePath = path.join(logPath, `${logsName}${timestamp}.log`)

        this.confLevel = level
    }
    
    #getDateTime() {
        const now = new Date()
        const date = now.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
        return date
    }

    createLog(type, message, logLevel = -1) {
        const levels = Logger.LEVELS
        const logType = type.toLowerCase()
        const configLevel = this.confLevel

        logLevel = logLevel == -1 ? levels[logType] : logLevel
        if(configLevel > logLevel) {
            this.log = null;
            return false; 
        }
        const dateTime = this.#getDateTime()

        const logMessage = `[${dateTime} - ${logType.toUpperCase()}] ${message}`

        const log = {logType, logMessage}
        this.log = log
        return true
    }

    print() {
        if (!this.log) return;
        const {logType, logMessage} = this.log
        switch (logType) {
            case 'error':
                console.error(logMessage)
                break
            case 'warn':
                console.warn(logMessage)
                break
            default:
                console.log(logMessage)
                break
        }
    }

    write() {
        if (!this.log || !this.logFilePath) return
        const {logMessage} = this.log
        const filePath = this.logFilePath
        fs.appendFileSync(filePath, logMessage + '\n', 'utf8');
    }
}