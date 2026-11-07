import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import type { SubTexture } from '../../textures/SubTexture.js';
import { type Texture } from '../../textures/Texture.js';
import { CoreContextTexture } from '../CoreContextTexture.js';
import type { HaltiImageSourceRect } from './HaltiTypes.js';
export declare class HaltiContextTexture extends CoreContextTexture {
    private canvas;
    private directUrl;
    private baseUrl;
    private readonly tintedUrls;
    private dimensions;
    constructor(memManager: TextureMemoryManager, textureSource: Texture);
    load(): void;
    getUrl(color?: number): string | null;
    private getBaseUrl;
    private captureDirectImageSource;
    private capture;
    release(): void;
    free(): void;
}
export declare class HaltiSubTexture extends CoreContextTexture {
    constructor(memManager: TextureMemoryManager, textureSource: SubTexture);
    private get source();
    private get parentContext();
    get sourceRect(): HaltiImageSourceRect;
    getUrl(color?: number): string | null;
    load(): void;
    release(): void;
    free(): void;
}
