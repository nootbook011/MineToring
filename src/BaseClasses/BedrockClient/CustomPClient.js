import { Client as PClient } from 'bedrock-protocol';
import { nextUUID } from 'bedrock-protocol/src/datatypes/util.js';

import clientOptions from './Options/clientOptions.js';
import { client as bs } from './Options/baseOptions.js';

import crypto from 'crypto'
import { hasTrueValue } from '#extra/extraFunctions';

function validateSession(session, options) {
    session.isCustom = hasTrueValue({...session, isCustom: undefined})
    if (!session.isCustom) Object.assign(session, structuredClone(bs['session']))

    const data = {
        PlayFabId: session.pfid || nextUUID().replace(/-/g, '').slice(0, 16).toLowerCase(),
        DeviceId: session.devid || nextUUID(),
        SelfSignedId: session.ssignid || nextUUID()
    }
    Object.assign(session, {
        pfid: data.PlayFabId,
        devid: data.DeviceId,
        ssignid: data.SelfSignedId
    })

    if (!session.useVarious) options.skinData = {...options.skinData, ...data}
}

export class CustomPClient extends PClient {
    #session

    /**
     * 
     * @param {clientOptions} options 
     * @param {bs['session']} session 
     * @param {*} log 
     */
    constructor(options, session = undefined, log = () => { }) {
        validateSession(session, options)
        super(options)
        
        this.isInit = false
        this.#session = session
        this.Clog = log
        this.conLog = (m) => { this.Clog('origin client', m) }

        this.#replaceConnect(this._connect.bind(this))
    }

    init() {
        super.init()
        this.isInit = true
        this.#applySavedKeys()
    }

    #replaceConnect(originArrowConnect) {
        this._connect = async (sessionData) => {
            const session = this.#session
            if (!session.useVarious) {
                if (session.uuid) sessionData.uuid = session.uuid
                if (session.xuid) sessionData.xuid = session.xuid
            }
            else session.uuid = sessionData.uuid

            const keyPairData = {
                public: this.ecdhKeyPair.publicKey.export({ format: 'pem', type: 'spki' }),
                private: this.ecdhKeyPair.privateKey.export({ format: 'pem', type: 'sec1' })
            }

            if (session.isCustom) this.#debugCheckKeyPair(keyPairData, session)
            if (!session.encrypt?.private || !session.encrypt?.public) session.encrypt = keyPairData
            this?.Clog('client', JSON.stringify({ ...sessionData }))

            originArrowConnect(sessionData)
        }
    }

    #debugCheckKeyPair(keyPairData, session) {
        const { public: origPu, private: origPr } = keyPairData
        const { public: chanPu, private: chanPr } = session.encrypt || {}
        if (!chanPu || !chanPr) return

        if (origPr !== chanPr || origPu !== chanPu) {
            this?.Clog('error', `ecryption error! keyPair not change`)
        } else this.Clog('ecrypt', 'KeyPair check success!')
    }

    /**
    * #### Gets the current session.
    * * If no custom session is defined, it returns a session 
    * populated with randomized player data.
    * * Recommended to save a new session after closing
    * @returns {bs} The active or default randomized session.
    */
    get session() { return structuredClone(this.#session || {}) }

    #applySavedKeys() {
        if (!this.#session.isCustom || this.#session.useVarious) return

        const { encrypt } = this.#session
        const { public: pub, private: priv } = encrypt || {}
        if (!pub && !priv) return


        this.ecdhKeyPair = {
            publicKey: crypto.createPublicKey(pub),
            privateKey: crypto.createPrivateKey(priv)
        }

        this.publicKeyDER = this.ecdhKeyPair.publicKey.export({ format: 'der', type: 'spki' })
        this.privateKeyPEM = priv
        this.clientX509 = this.publicKeyDER.toString('base64')
        this?.Clog('ecrypt', 'keys has been changed')
    }

    sendLogin() {
        super.sendLogin()
        this.emit('login')
    }

    onPlayStatus(statusPacket) {
        //this.emit('Initialized')
        super.onPlayStatus(statusPacket)
    }
}