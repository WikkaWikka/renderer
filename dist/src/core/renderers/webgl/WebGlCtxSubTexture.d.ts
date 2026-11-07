import type { Dimensions } from '../../../common/CommonTypes.js';
import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import type { GlContextWrapper } from '../../platforms/GlContextWrapper.js';
import type { SubTexture } from '../../textures/SubTexture.js';
import { WebGlCtxTexture } from './WebGlCtxTexture.js';
export declare class WebGlCtxSubTexture extends WebGlCtxTexture {
    constructor(glw: GlContextWrapper, memManager: TextureMemoryManager, textureSource: SubTexture);
    onLoadRequest(): Dimensions;
    /**
     * Efficiently extracts width/height from polymorphic texture data
     * Optimized for performance by using type guards and avoiding unnecessary property access
     */
    private extractDimensions;
    /**
     * Type guard for objects with width/height properties
     */
    private hasWidthHeight;
    /**
     * Type guard for objects with w/h properties
     */
    private hasWH;
}
