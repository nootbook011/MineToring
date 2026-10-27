import { Client as PClient } from 'bedrock-protocol';
import crypto from 'crypto'
import { v3 as uuidv3 } from 'uuid';

import clientOptions from './Options/clientOptions.js';
import { client as clietnOpt } from "./Options/baseOptions.js"

export class BedrockSession {
    /** @type {import('crypto').UUID} */
    uuid = ""
    xuid = 0

    /** @type {import('crypto').UUID} */
    pfid = ""
    /** @type {import('crypto').UUID} */
    devid = ""
    /** @type {import('crypto').UUID} */
    ssignid = ""

    constructor(sessionObject = undefined) {
        if (!sessionObject) return
        this.sessionObject = sessionObject
    }

    get sessionObject() {
        const { uuid, xuid, pfid, devid, ssignid } = this
        return { uuid, xuid, pfid, devid, ssignid }
    }
    set sessionObject(session) {
        const { uuid, xuid, pfid, devid, ssignid } = session
        this.uuid = uuid
        this.xuid = xuid
        this.pfid = pfid
        this.devid = devid
        this.ssignid = ssignid
    }

    validate(name) {
        const { pfid, devid, ssignid, uuid } = this

        if (!pfid) this.generatePfid()
        if (!devid) this.generateDevid()
        if (!ssignid) this.generateSsignid()
        if (!uuid) this.generateUuid(name)
    }

    generateSession(name) {
        this.generatePfid()
        this.generateDevid()
        this.generateSsignid()
        this.generateUuid(name)
    }

    generatePfid() { this.pfid = crypto.randomUUID().replace(/-/g, '').slice(0, 16).toLowerCase() }
    generateDevid() { this.devid = crypto.randomUUID() }
    generateSsignid() { this.ssignid = crypto.randomUUID() }
    generateUuid(name) { this.uuid = uuidv3(name, '6ba7b811-9dad-11d1-80b4-00c04fd430c8') }
}

export class CustomPClient extends PClient {
    session

    /**
     * 
     * @param {clientOptions} options 
     * @param {typeof clietnOpt['session']} sessionObject
     * @param {*} log 
     */
    constructor(options, sessionOrObject = {}) {
        const session = sessionOrObject instanceof BedrockSession ? sessionOrObject : new BedrockSession(sessionOrObject)
        session.validate(options.username)
        Object.assign(options.skinData, {
            PlayFabId: session.pfid,
            DeviceId: session.devid,
            SelfSignedId: session.ssignid
        })

        super(options)

        this.isInit = false
        this.session = session
        this.Clog = () => { }
        this.conLog = (m) => { }

        this.#replaceConnect(this._connect.bind(this))
    }

    init() {
        super.init()
        this.isInit = true
    }

    #replaceConnect(originArrowConnect) {
        this._connect = async (sessionData) => {
            const session = this.session

            if (session.uuid) sessionData.uuid = session.uuid
            else session.uuid = sessionData.uuid

            if (session.xuid) sessionData.xuid = session.xuid
            else session.xuid = sessionData.xuid

            return originArrowConnect(sessionData)
        }
    }

    _tick() {
        super._tick()
        this.emit('tick')
    }
}