import type { CoreTextureManager } from '../CoreTextureManager.js';
import type { SubTextureProps } from './SubTexture.js';
import type { Dimensions } from '../../common/CommonTypes.js';
import { EventEmitter } from '../../common/EventEmitter.js';
import type { CoreContextTexture } from '../renderers/CoreContextTexture.js';
import type { Bound } from '../lib/utils.js';
import type { TextureError } from '../TextureError.js';
/**
 * Event handler for when a Texture is freed
 */
export type TextureFreedEventHandler = (target: any) => void;
/**
 * Event handler for when a Texture is loading
 */
export type TextureLoadingEventHandler = (target: any) => void;
/**
 * Event handler for when a Texture is loaded
 */
export type TextureLoadedEventHandler = (target: any, dimensions: Readonly<Dimensions>) => void;
/**
 * Represents compressed texture data.
 */
export interface CompressedData {
    /**
     * GLenum spcifying compression format
     */
    glInternalFormat: number;
    /**
     * All mipmap levels
     */
    mipmaps: ArrayBuffer[];
    /**
     * Supported container types ('pvr' or 'ktx').
     */
    type: 'PVR' | 'KTX' | 'ASTC';
    /**
     * The width of the compressed texture in pixels. Defaults to 0.
     *
     * @default 0
     */
    w: number;
    /**
     * The height of the compressed texture in pixels.
     **/
    h: number;
    /**
     * block info compressed texture format
     */
    blockInfo: {
        width: number;
        height: number;
        bytes: number;
    };
}
/**
 * Event handler for when a Texture fails to load
 */
export type TextureFailedEventHandler = (target: any, error: TextureError) => void;
/**
 * Distinguish pending texture data from resolved data.
 *
 * @remarks
 * TextureData always defines 'data' explicitly (even as null); a Promise
 * never has a 'data' property, so this distinguishes the two without an
 * instanceof check.
 */
export declare function isTextureDataPromise(value: TextureData | Promise<TextureData>): value is Promise<TextureData>;
/**
 * TextureData that is used to populate a CoreContextTexture
 */
export interface TextureData {
    /**
     * The texture data
     */
    data: ImageBitmap | ImageData | HTMLCanvasElement | SubTextureProps | CompressedData | HTMLImageElement | Uint8Array | null;
    /**
     * Premultiply alpha when uploading texture data to the GPU
     *
     * @defaultValue `false`
     */
    premultiplyAlpha?: boolean | null;
    /**
     * Whether `data` is already premultiplied. When set, `premultiplyAlpha`
     * is skipped on upload to avoid premultiplying twice.
     *
     * @defaultValue `undefined` (treated as `true` for `ImageBitmap` sources)
     */
    premultiplied?: boolean;
}
/**
 * TextureCoords generally numbers between 0 - 1
 */
export type TextureCoords = Bound;
export type TextureState = 'initial' | 'loading' | 'loaded' | 'failed' | 'freed';
export declare enum TextureType {
    generic = 0,
    color = 1,
    image = 2,
    noise = 3,
    renderToTexture = 4,
    subTexture = 5
}
/**
 * Represents a source of texture data for a CoreContextTexture.
 *
 * @remarks
 * Texture sources are used to populate a CoreContextTexture when that texture
 * is loaded. Texture data retrieved by the CoreContextTexture by the
 * `getTextureData` method. It's the responsibility of the concerete `Texture`
 * subclass to implement this method appropriately.
 */
export declare abstract class Texture extends EventEmitter {
    protected txManager: CoreTextureManager;
    /**
     * The dimensions of the texture
     *
     * @remarks
     * Until the texture data is loaded for the first time the value will be
     * `null`.
     */
    private _dimensions;
    private _error;
    state: TextureState;
    readonly renderableOwners: Set<string | number>;
    readonly renderable: boolean;
    type: TextureType;
    preventCleanup: boolean;
    ctxTexture: CoreContextTexture | undefined;
    loadGeneration: number;
    notifyContextLost(): void;
    textureData: TextureData | null;
    memUsed: number;
    /**
     * Cache key assigned by CoreTextureManager when this texture is stored
     * in the key cache. `null` when the texture is not cached.
     */
    cacheKey: string | null;
    /**
     * Memory used by this texture in bytes
     *
     * @remarks
     * This is tracked by the TextureMemoryManager and updated when the texture
     * is loaded/freed. Set to 0 when texture is not loaded.
     */
    retryCount: number;
    maxRetryCount: number;
    /**
     * Timestamp when texture was created (for startup grace period)
     */
    private createdAt;
    /**
     * Flag to track if grace period has expired to avoid repeated Date.now() calls
     */
    private gracePeriodExpired;
    /**
     * Grace period in milliseconds to prevent premature cleanup during app startup
     * This helps prevent race conditions when bounds calculation is delayed
     */
    private static readonly STARTUP_GRACE_PERIOD;
    constructor(txManager: CoreTextureManager);
    get dimensions(): Dimensions | null;
    get error(): TextureError | null;
    /**
     * Checks if the texture is within the startup grace period.
     * During this period, textures are protected from cleanup to prevent
     * race conditions during app initialization.
     */
    isWithinStartupGracePeriod(): boolean;
    /**
     * Checks if the texture can be safely cleaned up.
     * Considers the renderable state, startup grace period, and renderable owners.
     */
    canBeCleanedUp(): boolean;
    /**
     * Add/remove an owner to/from the Texture based on its renderability.
     *
     * @remarks
     * Any object can own a texture, be it a CoreNode or even the state object
     * from a Text Renderer.
     *
     * When the reference to the texture that an owner object holds is replaced
     * or cleared it must call this with `renderable=false` to release the owner
     * association.
     *
     * @param owner
     * @param renderable
     */
    setRenderableOwner(owner: string | number, renderable: boolean): void;
    load(): void;
    /**
     * Cancel the in-flight load and return to `initial`; `load()` restarts it.
     *
     * @remarks
     * Bumping the generation drops the result when it arrives, like a load
     * that was in flight during context loss; {@link abortLoad} additionally
     * stops the request where the platform supports it.
     * A texture can be shared, this is a no-op while more than one owner
     * requires it.
     *
     * Priority loads are not guarded.
     */
    cancel(): void;
    /**
     * Event called when the Texture becomes renderable or unrenderable.
     *
     * @remarks
     * Used by subclasses like SubTexture propogate then renderability of the
     * Texture to other referenced Textures.
     *
     * @param isRenderable `true` if this Texture has renderable owners.
     */
    onChangeIsRenderable?(isRenderable: boolean): void;
    /**
     * Load the core context texture for this Texture.
     * The ctxTexture is created by the renderer and lives on the GPU.
     *
     * @returns
     */
    loadCtxTexture(): CoreContextTexture;
    /**
     * Free the core context texture for this Texture.
     *
     * @remarks
     * The ctxTexture is created by the renderer and lives on the GPU.
     */
    free(): void;
    /**
     * Release the texture data and core context texture for this Texture without changing state.
     *
     * @remarks
     * The ctxTexture is created by the renderer and lives on the GPU.
     */
    release(): void;
    invalidateContext(): void;
    /**
     * Destroy the texture.
     *
     * @remarks
     * This method is called when the texture is no longer needed and should be
     * cleaned up.
     */
    destroy(): void;
    /**
     * Free the source texture data for this Texture.
     *
     * @remarks
     * The texture data is the source data that is used to populate the CoreContextTexture.
     * e.g. ImageData that is downloaded from a URL.
     */
    freeTextureData(): void;
    setState(state: TextureState, errorOrDimensions?: TextureError | Dimensions): void;
    /**
     * Get the texture data for this texture.
     *
     * @remarks
     * This method is called by the CoreContextTexture when the texture is loaded.
     * The texture data is then used to populate the CoreContextTexture.
     *
     * @returns
     * The texture data for this texture.
     */
    getTextureData(): TextureData | Promise<TextureData>;
    /**
     * Task for queueMicrotask to free texture data.
     *
     * @remarks
     * This method is called in a microtask to free the texture data.
     */
    private freeTextureDataTask;
    /**
     * Task for queueMicrotask to release the texture.
     *
     * @remarks
     * This method is called in a microtask to release the texture.
     */
    private releaseTask;
    /**
     * Get the texture source for this texture.
     *
     * @remarks
     * This method is called by the CoreContextTexture when the texture is loaded.
     * The texture source is then used to populate the CoreContextTexture.
     */
    abstract getTextureSource(): TextureData | Promise<TextureData>;
    /**
     * Make a cache key for this texture.
     *
     * @remarks
     * Each concrete `Texture` subclass must implement this method to provide an
     * appropriate cache key for the texture type including the texture's
     * properties that uniquely identify a copy of the texture. If the texture
     * type does not support caching, then this method should return `false`.
     *
     * @param props
     * @returns
     * A cache key for this texture or `false` if the texture type does not
     * support caching.
     */
    static makeCacheKey(props: unknown): string | false;
    /**
     * Resolve the default values for the texture's properties.
     *
     * @remarks
     * Each concrete `Texture` subclass must implement this method to provide
     * default values for the texture's optional properties.
     *
     * @param props
     * @returns
     * The default values for the texture's properties.
     */
    static resolveDefaults(props: unknown): Record<string, any>;
}
