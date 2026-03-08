import fs from "fs/promises"
import { fileURLToPath } from 'url';
import path from 'path';

// 1. Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);

// 2. Получаем путь к текущей папке
const __dirname = path.dirname(__filename)

const pathToFiles = path.join(__dirname, 'mcdata')

export const data = {
    chunk: await getParsedFileFromPath(pathToFiles, "Chunck"),
    subChunks: await getParsedFileFromPath(pathToFiles, "subChuncks"),
    startGame: await getParsedFileFromPath(pathToFiles, "startGame")
}

export const rawSubs = data.subChunks["subChunk-1"]
export const rawChunk = data.chunk["Chunk-X(0)Z(0)"]

async function getParsedFileFromPath(path, fileName) {
    const fileData = await fs.readFile(`${path}\\${fileName}.json`)
    return JSON.parse(fileData)
}

export function parseBigIntToString(value) {
    if (typeof value === 'bigint') {
        return value.toString()
    }
    return value
}