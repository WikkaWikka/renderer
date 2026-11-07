import type { CoreRenderer } from './renderers/CoreRenderer.js';
import { ColorTexture } from './textures/ColorTexture.js';
import { ImageTexture } from './textures/ImageTexture.js';
import { CanvasTextTexture } from './textures/CanvasTextTexture.js';
import { NoiseTexture } from './textures/NoiseTexture.js';
import { SubTexture } from './textures/SubTexture.js';
import { RenderTexture } from './textures/RenderTexture.js';
import { Texture } from './textures/Texture.js';
import { EventEmitter } from '../common/EventEmitter.js';
import type { Stage } from './Stage.js';
import type { Platform } from './platforms/Platform.js';
/**
 * Augmentable map of texture class types
 *
 * @remarks
 * This interface can be augmented by other modules/apps to add additional
 * texture types. The ones included directly here are the ones that are
 * included in the core library.
 */
export interface TextureMap {
    ColorTexture: typeof ColorTexture;
    ImageTexture: typeof ImageTexture;
    CanvasTextTexture: typeof CanvasTextTexture;
    NoiseTexture: typeof NoiseTexture;
    SubTexture: typeof SubTexture;
    RenderTexture: typeof RenderTexture;
}
export type ExtractProps<Type> = Type extends {
    z$__type__Props: infer Props;
} ? Props : never;
/**
 * Contains information about the texture manager's internal state
 * for debugging purposes.
 */
export interface TextureManagerDebugInfo {
    keyCacheSize: number;
}
export interface TextureManagerSettings {
    createImageBitmapSupport: 'auto' | 'basic' | 'options' | 'full';
    maxRetryCount: number;
}
export type ResizeModeOptions = {
    /**
     * Specifies that the image should be resized to cover the specified dimensions.
     */
    type: 'cover';
    /**
     * The horizontal clipping position
     * To clip the left, set clipX to 0. To clip the right, set clipX to 1.
     * clipX 0.5 will clip a equal amount from left and right
     *
     * @defaultValue 0.5
     */
    clipX?: number;
    /**
     * The vertical clipping position
     * To clip the top, set clipY to 0. To clip the bottom, set clipY to 1.
     * clipY 0.5 will clip a equal amount from top and bottom
     *
     * @defaultValue 0.5
     */
    clipY?: number;
} | {
    /**
     * Specifies that the image should be resized to fit within the specified dimensions.
     */
    type: 'contain';
};
/**
 * Universal options for all texture types
 *
 * @remarks
 * Texture Options provide a way to specify options that are relevant to the
 * texture loading process (including caching) and specifically for how a
 * texture is rendered within a specific Node (or set of Nodes).
 *
 * They are not used in determining the cache key for a texture (except if
 * the `cacheKey` option is provided explicitly to oveerride the default
 * cache key for the texture instance) nor are they stored/referenced within
 * the texture instance itself. Instead, the options are stored/referenced
 * within individual Nodes. So a single texture instance can be used in
 * multiple Nodes each using a different set of options.
 */
export interface TextureOptions {
    /**
     * Preload the texture immediately even if it's not being rendered to the
     * screen.
     *
     * @remarks
     * This allows the texture to be used immediately without any delay when it
     * is first needed for rendering. Otherwise the loading process will start
     * when the texture is first rendered, which may cause a delay in that texture
     * being shown properly.
     *
     * @defaultValue `false`
     */
    preload?: boolean;
    /**
     * Prevent clean up of the texture when it is no longer being used.
     *
     * @remarks
     * This is useful when you want to keep the texture in memory for later use.
     * Regardless of whether the texture is being used or not, it will not be
     * cleaned up.
     *
     * @defaultValue `false`
     */
    preventCleanup?: boolean;
    /**
     * Number of times to retry loading a failed texture
     *
     * @remarks
     * When a texture fails to load, Lightning will retry up to this many times
     * before permanently giving up. Each retry will clear the texture ownership
     * and then re-establish it to trigger a new load attempt.
     *
     * Set to null to disable retries. Set to 0 to always try once and never retry.
     * This is typically only used on ImageTexture instances.
     *
     */
    maxRetryCount?: number | null;
    /**
     * Flip the texture horizontally when rendering
     *
     * @defaultValue `false`
     */
    flipX?: boolean;
    /**
     * Flip the texture vertically when rendering
     *
     * @defaultValue `false`
     */
    flipY?: boolean;
    /**
     * You can use resizeMode to determine the clipping automatically from the width
     * and height of the source texture. This can be convenient if you are unsure about
     * the exact image sizes but want the image to cover a specific area.
     *
     * The resize modes cover and contain are supported
     */
    resizeMode?: ResizeModeOptions;
}
export declare class CoreTextureManager extends EventEmitter {
    /**
     * Map of textures by cache key
     */
    keyCache: Map<string, Texture>;
    /**
     * Map of texture constructors by their type name
     */
    txConstructors: Partial<TextureMap>;
    maxRetryCount: number;
    private uploadTextureQueue;
    private contextTextures;
    private restoreTextures;
    private pendingContextLoads;
    private contextGeneration;
    private stage;
    platform: Platform;
    /**
     * Renderer that this texture manager is associated with
     *
     * @remarks
     * This MUST be set before the texture manager is used. Otherwise errors
     * will occur when using the texture manager.
     */
    renderer: CoreRenderer;
    trackContextTexture(texture: Texture): void;
    notifyContextLost(): void;
    untrackContextTexture(texture: Texture): void;
    invalidateContext(): void;
    restoreContext(): void;
    /**
     * The current frame time in milliseconds
     *
     * @remarks
     * This is used to populate the `lastRenderableChangeTime` property of
     * {@link Texture} instances when their renderable state changes.
     *
     * Set by stage via `updateFrameTime` method.
     */
    frameTime: number;
    constructor(stage: Stage, settings: TextureManagerSettings);
    registerTextureType<Type extends keyof TextureMap>(textureType: Type, textureClass: TextureMap[Type]): void;
    /**
     * Enqueue a texture for uploading to the GPU.
     *
     * @param texture - The texture to upload
     */
    enqueueUploadTexture(texture: Texture): void;
    /**
     * Create a texture
     *
     * @param textureType - The type of texture to create
     * @param props - The properties to use for the texture
     */
    createTexture<Type extends keyof TextureMap>(textureType: Type, props: ExtractProps<TextureMap[Type]>): InstanceType<TextureMap[Type]>;
    /**
     * Load a texture: fetch its data, then upload it to the GPU. Image
     * textures are queued for throttled upload unless `priority` is set.
     *
     * @remarks
     * Fire-and-forget: listen to the texture's `loaded` / `failed` events for
     * completion.
     *
     * @param texture - The texture to load
     * @param priority - Upload immediately instead of queueing (images only)
     */
    loadTexture(texture: Texture, priority?: boolean): void;
    private loadTextureAsync;
    private uploadOrEnqueueTexture;
    private failTextureLoad;
    uploadTexture(texture: Texture): void;
    /**
     * Check if a texture is being processed
     */
    isProcessingTexture(texture: Texture): boolean;
    /**
     * Process a limited number of uploads.
     *
     * @param maxProcessingTime - The maximum processing time in milliseconds
     * @param maxCount - The maximum number of textures to process in this call
     */
    processSome(maxProcessingTime: number, maxCount: number): void;
    hasUpdates(): boolean;
    /**
     * Initialize a texture to the cache
     *
     * @param texture Texture to cache
     * @param cacheKey Cache key for the texture
     */
    initTextureToCache(texture: Texture, cacheKey: string): void;
    /**
     * Get a texture from the cache
     *
     * @param cacheKey
     */
    getTextureFromCache(cacheKey: string): Texture | undefined;
    /**
     * Remove a texture from the cache
     *
     * @remarks
     * Called by Texture Cleanup when a texture is freed.
     *
     * @param texture
     */
    removeTextureFromCache(texture: Texture): void;
    /**
     * Remove texture from the upload queue
     *
     * @param texture - The texture to remove
     */
    removeTextureFromQueue(texture: Texture): void;
    /**
     * Drop a cancelled load from the upload queue and context-loss tracking.
     *
     * @param texture - The texture whose load was cancelled
     */
    forgetLoad(texture: Texture): void;
    /**
     * Destroy the CoreTextureManager and release all internal references.
     *
     * @remarks
     * Clears the upload queue, context-loss tracking sets, and key/inverse-key
     * caches so that queued textures can be garbage-collected after a renderer
     * teardown — including a teardown while the context is lost with pending
     * restores. Bumps the context generation so in-flight decodes abort
     * instead of uploading after destroy.
     */
    destroy(): void;
    /**
     * Resolve a parent texture from the cache or fallback to the provided texture.
     *
     * @param texture - The provided texture to resolve.
     * @returns The cached or provided texture.
     */
    resolveParentTexture(texture: ImageTexture): Texture;
}
