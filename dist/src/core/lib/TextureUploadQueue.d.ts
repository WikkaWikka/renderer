import type { Texture } from '../textures/Texture.js';
export interface TextureUploadQueue {
    readonly size: number;
    has(texture: Texture): boolean;
    enqueue(texture: Texture): void;
    dequeue(): Texture | undefined;
    remove(texture: Texture): void;
    clear(): void;
}
/**
 * Creates a FIFO queue with O(1) membership check and O(1) cancellation.
 *
 * @remarks
 * Backed by an array (for ordering) and a Set (for fast lookup/cancel).
 * Cancelled entries are tombstoned (set to null) and skipped on dequeue.
 * The array is compacted when the head pointer exceeds half the array length
 * and is at least 64 entries deep, amortising the compaction cost.
 */
export declare function createTextureUploadQueue(): TextureUploadQueue;
