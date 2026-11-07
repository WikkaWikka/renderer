import type { CoreTextureManager } from '../CoreTextureManager.js';
import { Texture, TextureType, type TextureData } from './Texture.js';
import type { CompressedImageData } from '../platforms/web/lib/textureCompression.js';
/**
 * Properties of the {@link ImageTexture}
 */
export interface ImageTextureProps {
    /**
     * Source URL or image source for the image to be used as a texture.
     *
     * @remarks
     * The ImageData, ImageBitmap, and HTMLCanvasElement types are currently only
     * supported internally. End users should only set this property to a URL string.
     *
     * @default ''
     */
    src?: string | Blob | ImageData | ImageBitmap | HTMLCanvasElement | (() => ImageData | ImageBitmap | HTMLCanvasElement | null);
    /**
     * Whether to premultiply the alpha channel into the color channels of the
     * image.
     *
     * @remarks
     * Generally this should be set to `true` (the default). However, if the
     * texture's associated Shader expects straight (non-premultiplied) colors,
     * this should be set to `false`.
     *
     * @default true
     */
    premultiplyAlpha?: boolean | null;
    /**
     * `ImageData` textures are not cached unless a `key` is provided
     */
    key?: string | null;
    /**
     * Width of the image to be used as a texture. If not provided, the image's
     * natural width will be used.
     */
    w?: number | null;
    /**
     * Height of the image to be used as a texture. If not provided, the image's
     * natural height will be used.
     */
    h?: number | null;
    /**
     * Type, indicate an image type for overriding type detection
     *
     * @default null
     */
    type?: 'regular' | 'compressed' | 'svg' | null;
    /**
     * The width of the rectangle from which the ImageBitmap will be extracted. This value
     * can be negative. Only works when createImageBitmap is supported on the browser.
     *
     * @default null
     */
    sw?: number | null;
    /**
     * The height of the rectangle from which the ImageBitmap will be extracted. This value
     * can be negative. Only works when createImageBitmap is supported on the browser.
     *
     * @default null
     */
    sh?: number | null;
    /**
     * The y coordinate of the reference point of the rectangle from which the ImageBitmap
     * will be extracted. Only used when `sw` and `sh` are provided. And only works when
     * createImageBitmap is available.
     *
     * @default null
     */
    sx?: number | null;
    /**
     * The x coordinate of the reference point of the rectangle from which the
     * ImageBitmap will be extracted. Only used when source `sw` width and `sh` height
     * are provided. Only works when createImageBitmap is supported on the browser.
     *
     * @default null
     */
    sy?: number | null;
    /**
     * Maximum number of times to retry loading the image if it fails.
     *
     * @default 5
     */
    maxRetryCount?: number;
}
export interface ImageResponse {
    data: ImageBitmap | ImageData | CompressedImageData | HTMLImageElement | null;
    /**
     * Whether the decoded pixel data is already premultiplied.
     *
     * @remarks
     * Must describe the pixels actually produced. Platforms that honour
     * `createImageBitmap({ premultiplyAlpha })` set this to that request.
     * Platforms that cannot (Chrome50, HTMLImageElement, SVG, compressed)
     * set this to `false`.
     */
    premultiplied: boolean;
}
/**
 * Texture consisting of an image loaded from a URL
 *
 * @remarks
 * The ImageTexture's {@link ImageTextureProps.src} prop defines the image URL
 * to be downloaded.
 *
 * By default, the texture's alpha values will be premultiplied into its color
 * values which is generally the desired setting before they are sent to the
 * texture's associated {@link Shader}. However, in special cases you may want
 * the Shader to receive straight (non-premultiplied) values. In that case you
 * can disable the default behavior by setting the
 * {@link ImageTextureProps.premultiplyAlpha} prop to `false`.
 */
export declare class ImageTexture extends Texture {
    private platform;
    props: Required<ImageTextureProps>;
    type: TextureType;
    constructor(txManager: CoreTextureManager, props: Required<ImageTextureProps>);
    getTextureSource(): TextureData | Promise<TextureData>;
    private finishTextureSource;
    determineImageTypeAndLoadImage(): Promise<ImageResponse> | {
        data: null;
        premultiplyAlpha?: undefined;
    } | {
        data: HTMLCanvasElement | ImageBitmap | ImageData | null;
        premultiplyAlpha: boolean | null;
    };
    /**
     * Generates a cache key for the ImageTexture based on the provided props.
     * @param props - The props used to generate the cache key.
     * @returns The cache key as a string, or `false` if the key cannot be generated.
     */
    static makeCacheKey(props: ImageTextureProps): string | false;
    static resolveDefaults(props: ImageTextureProps): Required<ImageTextureProps>;
    static z$__type__Props: ImageTextureProps;
}
/**
 * Tests if the given location is a SVG
 * @param url
 * @remarks
 * This function is used to determine if the given image url is a SVG
 * image
 * @returns
 */
export declare function isSvgImage(url: string): boolean;
/**
 * Tests if the given location is a compressed texture container
 * @param url
 * @remarks
 * This function is used to determine if the given image url is a compressed
 * and only supports the following extensions: .ktx and .pvr
 * @returns
 */
export declare function isCompressedTextureContainer(src: string): boolean;
