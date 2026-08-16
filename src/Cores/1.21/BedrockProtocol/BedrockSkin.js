import { createReadStream, createWriteStream } from "node:fs"
import { readFile, access, mkdir, readdir, writeFile } from "node:fs/promises";
import { PNG } from "pngjs"
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseAssets = path.join(__dirname, '../BedrockStorage/Assets/skins')

export class BedrockSkin {
    #skinId = ''
    #capeId = ''

    #skinData = {
        width: 0,
        height: 0,
        data: new Uint8Array([]),
    }
    get hasSkinData() { return !!this.#skinData.width }

    #capeData = {
        width: 0,
        height: 0,
        data: new Uint8Array([]),
    }
    get hasCapeData() { return !!this.#capeData.width }

    #geometryData = undefined

    injector(player) {
        player.skin = this
    }

    constructor(skinObject = undefined) {
        if (skinObject) this.buildFromSkin(skinObject)
    }

    async create(skinPath = undefined, capePath = undefined, geometryPath = undefined, armSize = 'wide') {
        this.#skinId = `${crypto.randomUUID()}.Skin`
        if (capePath) this.#capeId = `${crypto.randomUUID()}.Cape`

        if (!skinPath) skinPath = await this.#chooseRandomSkin()
        else if (!path.isAbsolute(skinPath)) skinPath = path.join(baseAssets, skinPath)
        this.#skinData = await this.#imageToData(skinPath)
        if (capePath) this.#capeData = await this.#imageToData(capePath)

        if (!geometryPath) geometryPath = path.join(baseAssets, 'geometry.json')
        this.#geometryData = await this.#readGeometry(geometryPath)

        this.armSize = armSize
    }

    async #chooseRandomSkin() {
        const skinsPath = path.join(baseAssets, 'base')

        const skins = await readdir(skinsPath)
        const randomIndex = Math.floor(Math.random() * skins.length)
        const randomFile = skins[randomIndex]

        return path.join(skinsPath, randomFile)
    }

    buildFromSkin(skin) {
        this.#skinData = skin.skin_data
        this.#capeData = skin.cape_data
        this.#geometryData = skin.geometry_data
        this.#skinId = skin.skin_id
        this.#capeId = skin.cape_id
        this.armSize = skin.arm_size
    }

    readSkinLoginFormat() {
        return {
            AnimatedImageData: [],
            ArmSize: this.armSize ?? "wide",
            CapeData: this.hasCapeData ? Buffer.from(this.#capeData.data).toString('base64') : "",
            CapeId: this.#capeId,
            CapeImageHeight: this.#capeData.height,
            CapeImageWidth: this.#capeData.width,
            CapeOnClassicSkin: false,
            PersonaPieces: [],
            PersonaSkin: false,
            PieceTintColors: [],
            PremiumSkin: false,
            SkinAnimationData: "",
            SkinColor: "#0",
            SkinData: this.hasSkinData ? Buffer.from(this.#skinData.data).toString('base64') : "",
            SkinGeometryData: Buffer.from(JSON.stringify(this.#geometryData), 'utf8').toString('base64'),
            SkinGeometryDataEngineVersion: Buffer.from(this.#geometryData?.format_version ?? "1.4.0", 'utf8').toString('base64'),
            SkinId: this.#skinId,
            SkinImageHeight: this.#skinData.height,
            SkinImageWidth: this.#skinData.width,
            SkinResourcePatch: Buffer.from(JSON.stringify({geometry: { default: "geometry.humanoid.custom" }}), 'utf8').toString('base64'),
        }
    }
    readSkin(play_fab_id = undefined) {
        return {
            skin_id: this.#skinId,
            play_fab_id: play_fab_id ?? '',
            skin_resource_pack: JSON.stringify({
                geometry: {
                    default: "geometry.humanoid.custom"
                }
            }),
            skin_data: this.#skinData,
            animations: [],
            cape_data: this.#capeData,
            geometry_data: JSON.stringify(this.#geometryData),
            geometry_data_version: this.#geometryData?.format_version ?? "1.4.0",
            animation_data: "",
            cape_id: this.#capeId,
            full_skin_id: this.#skinId,
            arm_size: this.armSize ?? "wide",
            skin_color: "#0",
            personal_pieces: [],
            piece_tint_colors: [],
            premium: false,
            persona: false,
            cape_on_classic: false,
            primary_user: false,
            overriding_player_appearance: false
        }
    }

    async writeSkin(pathToSaveDirectory, saveGeometry = true) {
        await access(pathToSaveDirectory)

        async function checkDir(targetPath, dirName) {
            const fullPath = path.join(targetPath, dirName)

            try {
                await access(fullPath)
            } catch (e) {
                await mkdir(fullPath, { recursive: true })
            }

            return fullPath
        }

        if (this.hasSkinData) {
            const skins = await checkDir(pathToSaveDirectory, 'Skins')
            await this.#dataToImage(path.join(skins, `${this.#skinId.slice(0, -5)}.png`), this.#skinData)
        }
        if (this.hasCapeData) {
            const capes = await checkDir(pathToSaveDirectory, 'Capes')
            await this.#dataToImage(path.join(capes, `${this.#capeId.slice(0, -5)}.png`), this.#capeData)
        }
        if (saveGeometry) {
            const geometry = await checkDir(pathToSaveDirectory, 'Geometry')
            await writeFile(path.join(geometry, `${this.#skinId.slice(0, -5)}-geometry.json`), JSON.stringify(this.#geometryData))
        }
    }

    async #readGeometry(geometryPath) {
        const data = await readFile(geometryPath, { encoding: 'utf8' })
        return JSON.parse(data)
    }

    #imageToData(path) {
        return new Promise((resolve, reject) => {
            createReadStream(path)
                .pipe(new PNG())
                .on("parsed", function () {
                    const byteArray = Array.from(this.data)

                    resolve({
                        width: this.width,
                        height: this.height,
                        data: {
                            type: "Buffer",
                            data: byteArray
                        }
                    })
                })
                .on("error", (err) => {
                    reject(err)
                })
        })
    }

    #dataToImage(path, imageData) {
        return new Promise((resolve, reject) => {
            const { width, height, data } = imageData

            const png = new PNG({ width, height })

            const rawData = data && data.data ? data.data : data
            png.data = Buffer.from(rawData)

            png.pack()
                .pipe(createWriteStream(path))
                .on("finish", () => {
                    resolve(path)
                })
                .on("error", (err) => {
                    reject(err)
                })
        })
    }

}