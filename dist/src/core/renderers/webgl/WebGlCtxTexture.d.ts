import type { Dimensions } from '../../../common/CommonTypes.js';
import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import type { GlContextWrapper } from '../../platforms/GlContextWrapper.js';
import type { Texture } from '../../textures/Texture.js';
import { CoreContextTexture } from '../CoreContextTexture.js';
import type { Bound } from '../../lib/utils.js';
/**
 * A wrapper around a WebGLTexture that handles loading the texture data
 * from a Texture source and uploading it to the GPU as well as freeing
 * the uploaded texture.
 *
 * @remarks
 * When accessing the ctxTexture property, the texture will be loaded if
 * it hasn't been already. ctxTexture will always return a valid WebGLTexture
 * and trigger the loading/uploading of the texture's data if it hasn't been
 * loaded yet.
 */
export declare class WebGlCtxTexture extends CoreContextTexture {
    protected glw: GlContextWrapper;
    protected _nativeCtxTexture: WebGLTexture | null;
    private contextInvalidated;
    invalidateContext(): void;
    private _w;
    private _h;
    txCoords: Bound;
    constructor(glw: GlContextWrapper, memManager: TextureMemoryManager, textureSource: Texture);
    /**
     * GL error check with direct state marking
     * Uses cached error result to minimize function calls
     */
    private checkGLError;
    get ctxTexture(): WebGLTexture | null;
    get w(): number;
    get h(): number;
    /**
     * Load the texture data from the Texture source and upload it to the GPU
     *
     * @remarks
     * This method is called automatically when accessing the ctxTexture property
     * if the texture hasn't been loaded yet. But it can also be called manually
     * to force the texture to be pre-loaded prior to accessing the ctxTexture
     * property.
     */
    load(): void;
    /**
     * Called when the texture data needs to be loaded and uploaded to a texture
     */
    onLoadRequest(): Dimensions;
    /**
     * Free the WebGLTexture from the GPU
     *
     * @returns
     */
    free(): void;
    /**
     * Release the WebGLTexture from the GPU without changing state
     */
    release(): void;
    /**
     * Create native context texture asynchronously
     *
     * @remarks
     * When this method resolves, the returned texture will be bound to the GL context state
     * and fully ready for use. This ensures proper GPU resource allocation timing.
     *
     * @returns Promise that resolves to the native WebGL texture or null on failure
     */
    protected createNativeCtxTexture(): WebGLTexture | null;
}
