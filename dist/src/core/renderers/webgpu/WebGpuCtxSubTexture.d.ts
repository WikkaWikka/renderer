import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import type { SubTexture } from '../../textures/SubTexture.js';
import { CoreContextTexture } from '../CoreContextTexture.js';
export declare class WebGpuCtxSubTexture extends CoreContextTexture {
    constructor(memManager: TextureMemoryManager, textureSource: SubTexture);
    private get parentContextTexture();
    get texture(): GPUTexture | null;
    get view(): GPUTextureView | null;
    get version(): number;
    load(): void;
    release(): void;
    free(): void;
}
