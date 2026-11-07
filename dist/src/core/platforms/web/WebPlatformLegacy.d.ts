import { WebPlatform } from './WebPlatform.js';
import type { PlatformSettings } from '../Platform.js';
import type { ImageResponse } from '../../textures/ImageTexture.js';
import type { ImageWorkerFactory } from './lib/ImageWorker.js';
/**
 * Legacy Web Platform implementation that uses Image() instead of createImageBitmap
 *
 * @remarks
 * This platform is designed for environments that don't support createImageBitmap API,
 * or for compatibility with older browsers. It uses the traditional HTMLImageElement
 * approach for image loading.
 *
 */
export declare class WebPlatformLegacy extends WebPlatform {
    constructor(settings?: PlatformSettings);
    protected getImageWorkerFactory(): ImageWorkerFactory;
    loadImage(src: string, premultiplyAlpha: boolean, sx?: number | null, sy?: number | null, sw?: number | null, sh?: number | null): Promise<ImageResponse>;
    createImage(blob: Blob, premultiplyAlpha: boolean, sx: number | null, sy: number | null, sw: number | null, sh: number | null): Promise<ImageResponse>;
    loadCompressedTexture(src: string): Promise<ImageResponse>;
    /**
     * Load a font using CSS `@font-face` injection.
     *
     * @remarks
     * The `FontFace` JavaScript constructor used by {@link WebPlatform} relies on
     * the CSS Font Loading API. While the API is nominally present on Chrome 35+,
     * embedded/legacy browsers (QtWebKit, older WPEWebKit builds, some set-top-box
     * browsers) either lack the API entirely or silently drop fonts loaded this way
     * before they reach the canvas 2D rasteriser.
     *
     * Injecting a `<style>` block with an `@font-face` rule is the universally
     * supported alternative: every browser that renders text supports it.  When
     * `document.fonts.load()` is available we also trigger an eager load so that
     * the font is available immediately rather than on first paint.
     */
    loadFontFace(fontFamily: string, fontUrl: string): Promise<FontFace | null>;
}
