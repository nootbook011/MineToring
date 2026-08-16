import { Client as PClient } from 'bedrock-protocol';
import { ClientStatus } from 'bedrock-protocol/src/connection.js';

import clientOptions from './Options/clientOptions.js';
import { client as bs } from './Options/baseOptions.js';

import crypto from 'crypto'
import { hasTrueValue } from '#extra/extraFunctions';

function validateSession(session, options) {
    session.isCustom = session.useVarious ? false : hasTrueValue({...session, isCustom: undefined})
    if (!session.isCustom) Object.assign(session, structuredClone(bs['session']))
    
    const data = {
        PlayFabId: session.pfid || crypto.randomUUID().replace(/-/g, '').slice(0, 16).toLowerCase(),
        DeviceId: session.devid || crypto.randomUUID(),
        SelfSignedId: session.ssignid || crypto.randomUUID()
    }
    Object.assign(session, {
        pfid: data.PlayFabId,
        devid: data.DeviceId,
        ssignid: data.SelfSignedId
    })

    options.skinData = {...options.skinData, ...data}
}

export class CustomPClient extends PClient {
    #session

    /**
     * 
     * @param {clientOptions} options 
     * @param {bs['session']} session 
     * @param {*} log 
     */
    constructor(options, session = {}, log = () => { }) {
        validateSession(session, options)
        super(options)
        
        this.isInit = false
        this.#session = session
        this.Clog = log
        this.conLog = (m) => { }

        this.#replaceConnect(this._connect.bind(this))
    }

    init() {
        super.init()
        this.isInit = true
    }

    #replaceConnect(originArrowConnect) {
        this._connect = async (sessionData) => {
            const session = this.#session

            if (session.uuid) sessionData.uuid = session.uuid
            else session.uuid = sessionData.uuid

            if (session.xuid) sessionData.xuid = session.xuid
            else session.xuid = sessionData.xuid
            
            //this?.Clog('client', JSON.stringify({ ...session }, undefined, 2))

            originArrowConnect(sessionData)
        }
    }

    /**
    * #### Gets the current session.
    * * If no custom session is defined, it returns a session 
    * populated with randomized player data.
    * * Recommended to save a new session after closing
    * @returns {bs} The active or default randomized session.
    */
    get session() { return structuredClone(this.#session || {}) }

    _tick() {
        super._tick()
        this.emit('tick')
    }

    onPlayStatus(statusPacket) {
        //this.emit('Initialized')
        super.onPlayStatus(statusPacket)
    }
}