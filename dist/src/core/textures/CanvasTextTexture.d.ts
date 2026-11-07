import type { CoreTextureManager } from '../CoreTextureManager.js';
import { Texture, TextureType, type TextureData } from './Texture.js';
export interface CanvasTextTextureProps {
    /** Create a fresh pixel source for each load, including after eviction or context loss. */
    render: () => ImageBitmap | HTMLCanvasElement | null;
    /**
     * Stable cache key for the raster inputs (see {@link makeCanvasTextCacheKey}).
     *
     * @remarks
     * Textures created with equal keys share one raster via the texture
     * manager's keyCache — identical text in the same font/constraints uploads
     * and resides in GPU memory once no matter how many nodes use it. Omit (or
     * pass `null`) for an uncached, single-owner texture.
     */
    key?: string | null;
}
/**
 * Raster inputs that determine canvas text pixels.
 *
 * @remarks
 * Keep in sync with what `CanvasTextRenderer` consumes: `contain`,
 * `offsetY` and `verticalAlign` only affect node transforms (never pixels)
 * and are intentionally excluded, as is `color` for plain text (plain
 * rasters are white alpha masks tinted per node at draw time — rich text
 * bakes span colors, so it includes `color`).
 */
export interface CanvasTextCacheKeyProps {
    text: string;
    richText: boolean;
    fontFamily: string;
    fontStyle: string;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number;
    textAlign: string;
    maxLines: number;
    overflowSuffix: string;
    wordBreak: string;
    maxWidth: number;
    maxHeight: number;
    color: number;
}
/**
 * Build a stable keyCache key for a canvas text raster.
 */
export declare function makeCanvasTextCacheKey(props: CanvasTextCacheKeyProps): string;
/**
 * Rasterized canvas text with a regenerable source. The draw callback must
 * capture a snapshot of the text layout, not a mutable CoreTextNode's props.
 *
 * This uses the image type so the existing upload queue, context restore,
 * memory cleanup, and Canvas2D renderer all treat it as an image texture.
 */
export declare class CanvasTextTexture extends Texture {
    type: TextureType;
    props: CanvasTextTextureProps;
    private imageSource;
    constructor(txManager: CoreTextureManager, props: CanvasTextTextureProps);
    getTextureSource(): TextureData;
    private disposeSource;
    freeTextureData(): void;
    free(): void;
    /**
     * Release one owner's claim on this texture.
     *
     * @remarks
     * Drops `owner` from the renderable owners and aborts an in-flight load —
     * but only when no owner remains. A shared texture that other nodes still
     * need keeps loading untouched. GPU/data reclamation for unowned textures
     * happens through `TextureMemoryManager` cleanup, like image textures.
     */
    releaseOwner(owner: string | number): void;
    invalidateContext(): void;
    destroy(): void;
    static makeCacheKey(props: CanvasTextTextureProps): string | false;
    static resolveDefaults(props: CanvasTextTextureProps): CanvasTextTextureProps;
    static z$__type__Props: CanvasTextTextureProps;
}
