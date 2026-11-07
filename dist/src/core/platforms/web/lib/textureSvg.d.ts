import type { ImageResponse } from '../../../textures/ImageTexture.js';
/**
 * Loads a SVG image
 * @param url
 * @returns
 */
export declare const loadSvg: (url: string, width: number | null, height: number | null, sx?: number | null, sy?: number | null, sw?: number | null, sh?: number | null) => Promise<ImageResponse>;
