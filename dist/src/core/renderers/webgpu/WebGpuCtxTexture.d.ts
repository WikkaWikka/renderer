import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import type { Texture } from '../../textures/Texture.js';
import { CoreContextTexture } from '../CoreContextTexture.js';
export declare class WebGpuCtxTexture extends CoreContextTexture {
    private readonly device;
    private nativeTexture;
    private nativeView;
    private _w;
    private _h;
    private generation;
    constructor(device: GPUDevice, memManager: TextureMemoryManager, textureSource: Texture);
    get texture(): GPUTexture | null;
    get view(): GPUTextureView | null;
    get w(): number;
    get h(): number;
    get version(): number;
    load(): void;
    private upload;
    release(): void;
    free(): void;
}
