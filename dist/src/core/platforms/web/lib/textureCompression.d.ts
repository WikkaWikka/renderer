import { type CompressedData } from '../../../textures/Texture.js';
import type { ImageResponse } from '../../../textures/ImageTexture.js';
import type { WebGlContextWrapper } from '../WebGlContextWrapper.js';
export type UploadCompressedTextureFunction = (glw: WebGlContextWrapper, texture: WebGLTexture, data: CompressedData) => void;
/**
 * Loads a compressed texture container
 * @param url
 * @returns
 */
export declare const loadCompressedTexture: (url: string) => Promise<ImageResponse>;
export interface CompressedImageData {
    blockInfo: BlockInfo;
    glInternalFormat: number;
    mipmaps: ArrayBuffer[];
    w: number;
    h: number;
    type: 'PVR' | 'KTX' | 'ASTC';
}
export type BlockInfo = {
    width: number;
    height: number;
    bytes: number;
};
export declare const blockInfoMap: {
    [key: number]: BlockInfo;
};
