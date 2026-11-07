import type { Stage } from './Stage.js';
import { Texture } from './textures/Texture.js';
export interface TextureMemoryManagerSettings {
    /**
     * Critical Threshold (in bytes)
     *
     * @remarks
     * When the amount of memory used by textures exceeds this threshold,
     * the Renderer will immediately trigger a Texture Cleanup towards the
     * Target Threshold Level.
     *
     * When set to `0`, the Texture Memory Manager is disabled.
     *
     * @defaultValue `124e6` (118 MB)
     */
    criticalThreshold: number;
    /**
     * Target Threshold Level (as fraction of Critical Threshold)
     *
     * @remarks
     * This value is the fractional level of the Critical Threshold that the
     * Texture Memory Manager will attempt to maintain by cleaning up textures.
     * The Texture Memory Manager will attempt to keep the memory usage below
     * this level by freeing up non-renderable textures.
     *
     * Valid Range: 0.0 - 1.0
     *
     * @defaultValue `0.5`
     */
    targetThresholdLevel: number;
    /**
     * Interval between non-aggressive Texture Cleanups (in milliseconds)
     *
     * @remarks
     * Texture Memory Manager will perform a non aggressive Texture Cleanup no more
     * frequently than this interval when the scene becomes idle.
     *
     * @defaultValue `5,000` (5 seconds)
     */
    cleanupInterval: number;
    /**
     * Whether or not to log debug information
     *
     * @defaultValue `false`
     */
    debugLogging: boolean;
    /**
     * Baseline memory allocation for the Texture Memory Manager
     *
     * @remarks
     * Baseline texture memory is an allocation of memory by simply having a 1080p WebGL context.
     * This will be used on top of the memory used by textures to determine when to trigger a cleanup.
     *
     * @defaultValue `25e6` (25 MB)
     */
    baselineMemoryAllocation: number;
    /**
     * Do not exceed critical threshold
     *
     * @defaultValue `false`
     */
    doNotExceedCriticalThreshold: boolean;
}
export interface MemoryInfo {
    criticalThreshold: number;
    targetThreshold: number;
    renderableMemUsed: number;
    memUsed: number;
    renderableTexturesLoaded: number;
    loadedTextures: number;
    baselineMemoryAllocation: number;
}
/**
 * LRU (Least Recently Used) style memory manager for textures
 *
 * @remarks
 * This class is responsible for managing the memory usage of textures
 * in the Renderer. It keeps track of the memory used by each texture
 * and triggers a cleanup when the memory usage exceeds a critical
 * threshold (`criticalThreshold`).
 *
 * The cleanup process will free up non-renderable textures until the
 * memory usage is below a target threshold (`targetThresholdLevel`).
 *
 * The memory manager's clean up process will also be triggered when the
 * scene is idle for a certain amount of time (`cleanupInterval`).
 */
export declare class TextureMemoryManager {
    private stage;
    private memUsed;
    private loadedTextures;
    invalidateContext(): void;
    private criticalThreshold;
    private targetThreshold;
    private cleanupInterval;
    private debugLogging;
    private loggingID;
    private lastCleanupTime;
    private baselineMemoryAllocation;
    private hasWarnedAboveCritical;
    criticalCleanupRequested: boolean;
    doNotExceedCriticalThreshold: boolean;
    /**
     * The current frame time in milliseconds
     *
     * @remarks
     * This is used to determine when to perform Idle Texture Cleanups.
     *
     * Set by stage via `updateFrameTime` method.
     */
    frameTime: number;
    constructor(stage: Stage, settings: TextureMemoryManagerSettings);
    /**
     * Set the memory usage of a texture
     *
     * @param texture - The texture to set memory usage for
     * @param byteSize - The size of the texture in bytes
     */
    setTextureMemUse(texture: Texture, byteSize: number): void;
    checkCleanup(): boolean;
    checkCriticalCleanup(): boolean;
    /**
     * Destroy a texture and remove it from the memory manager
     *
     * @param texture - The texture to destroy
     */
    destroyTexture(texture: Texture): void;
    cleanup(full?: boolean): void;
    /**
     * Get the current texture memory usage information
     *
     * @remarks
     * This method is for debugging purposes and returns information about the
     * current memory usage of the textures in the Renderer.
     */
    getMemoryInfo(): MemoryInfo;
    updateSettings(settings: TextureMemoryManagerSettings): void;
    /**
     * Destroy the TextureMemoryManager and release all internal references.
     *
     * @remarks
     * Clears the debug-logging interval (if active) and empties all internal
     * texture tracking arrays so that held textures can be garbage-collected.
     */
    destroy(): void;
}
