import type { ImageResponse } from '../../../textures/ImageTexture.js';
export type ImageWorkerFactory = () => void;
type MessageCallback = [
    (value: ImageResponse) => void,
    (reason: unknown) => void
];
export declare class ImageWorkerManager {
    imageWorkersEnabled: boolean;
    messageManager: Record<number, MessageCallback>;
    workers: Worker[];
    workerLoad: number[];
    nextId: number;
    private readonly maxWorkers;
    private readonly workerFactory;
    private readonly blobURL;
    /**
     * @param maxWorkers Maximum pool size. Workers spawn on demand (see
     * {@link getImage}): the first image load spawns one worker and the pool
     * grows while all workers are busy, instead of spawning everything upfront.
     */
    constructor(maxWorkers: number, workerFactory: ImageWorkerFactory);
    private isLegacyResponse;
    private createImageFromBlob;
    private handleMessage;
    private createBlobURL;
    /**
     * Spawn one worker and append it to the pool.
     *
     * @returns Index of the new worker, or -1 when the pool is at capacity.
     */
    private addWorker;
    /**
     * Pick the worker for the next image, growing the pool on demand.
     *
     * @remarks
     * An idle worker wins immediately. When every worker is busy and the pool
     * is below capacity, a new worker spawns instead of queueing behind busy
     * ones; otherwise the least-loaded worker takes the job. Never returns -1:
     * the pool always grows from empty since capacity is at least 1.
     */
    private getNextWorkerIndex;
    getImage(src: string, premultiplyAlpha: boolean, sx: number | null, sy: number | null, sw: number | null, sh: number | null): Promise<ImageResponse>;
}
export {};
