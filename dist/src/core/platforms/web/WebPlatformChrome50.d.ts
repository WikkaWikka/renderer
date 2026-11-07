import { WebPlatform } from './WebPlatform.js';
import type { ImageResponse } from '../../textures/ImageTexture.js';
import type { ImageWorkerFactory } from './lib/ImageWorker.js';
/**
 * Chrome 50 Web Platform implementation with limited createImageBitmap support
 *
 * @remarks
 * This platform is designed for Chrome 50 and similar browsers that support
 * createImageBitmap but with a limited signature (no options or cropping parameters).
 *
 * Limitations:
 * - createImageBitmap is called without options (premultiplyAlpha, colorSpaceConversion, imageOrientation)
 * - Image cropping (sx, sy, sw, sh parameters) is not supported
 * - Image workers can still be used if enabled via settings
 */
export declare class WebPlatformChrome50 extends WebPlatform {
    protected getImageWorkerFactory(): ImageWorkerFactory;
    createImage(blob: Blob, premultiplyAlpha: boolean, sx: number | null, sy: number | null, sw: number | null, sh: number | null): Promise<ImageResponse>;
}
