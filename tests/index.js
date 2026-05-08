import os from "os";
import v8 from "v8";

export const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

export const getCpuUsage = (startHrTime, startUsage) => {
    const elapTimeNS = process.hrtime.bigint() - startHrTime;
    const elapTimeMS = Number(elapTimeNS) / 1000;

    const elapUsage = process.cpuUsage(startUsage);
    const totalUsageMS = elapUsage.user + elapUsage.system;

    const percent = (totalUsageMS / elapTimeMS / os.cpus().length) * 100;

    return Math.min(100, percent).toFixed(2);
}

export const getResourceSnapshot = () => {
    const mem = process.memoryUsage();
    const heap = v8.getHeapStatistics();
    return {
        rss: toMB(mem.rss),
        heapUsed: toMB(mem.heapUsed),
        heapTotal: toMB(mem.heapTotal),
        external: toMB(mem.external),
        heapLimit: toMB(heap.heap_size_limit)
    };
};
