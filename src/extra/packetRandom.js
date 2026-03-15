import { sleep } from "#extra/extraFunctions"
import random from 'random'
 
export async function randomTime(cb) {
    const delay = random.logNormal(Math.log(300), 0.5)()
    return sleep(delay).then(cb)
}

export async function randomSleep(ms, randomEffect = 0.2) {
    const delay = random.normal(ms, ms * randomEffect)();
    const finalDelay = Math.max(0, delay);
    return sleep(finalDelay)
}

export function getRandomDelay(ms, randomEffect = 0.2) {
    const delay = random.normal(ms, ms * randomEffect)();
    return Math.max(0, delay);
}

export function getClampedRandom(ms, min, max, randomEffect = 0.2) {
    const delay = random.normal(ms, ms * randomEffect)();
    return Math.min(Math.max(delay, min), max);
}