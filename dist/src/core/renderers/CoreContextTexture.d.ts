import type { TextureMemoryManager } from '../TextureMemoryManager.js';
import type { Texture } from '../textures/Texture.js';
export declare abstract class CoreContextTexture {
    readonly textureSource: Texture;
    private memManager;
    state: 'freed' | 'loading' | 'loaded' | 'failed';
    constructor(memManager: TextureMemoryManager, textureSource: Texture);
    protected setTextureMemUse(byteSize: number): void;
    abstract load(): void;
    abstract release(): void;
    abstract free(): void;
    get renderable(): boolean;
}
