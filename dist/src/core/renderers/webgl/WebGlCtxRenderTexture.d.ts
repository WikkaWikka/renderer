import type { Dimensions } from '../../../common/CommonTypes.js';
import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import type { GlContextWrapper } from '../../platforms/GlContextWrapper.js';
import type { Bound } from '../../lib/utils.js';
import type { RenderTexture } from '../../textures/RenderTexture.js';
import { WebGlCtxTexture } from './WebGlCtxTexture.js';
export declare class WebGlCtxRenderTexture extends WebGlCtxTexture {
    textureSource: RenderTexture;
    framebuffer: WebGLFramebuffer | null;
    txCoords: Bound;
    constructor(glw: GlContextWrapper, memManager: TextureMemoryManager, textureSource: RenderTexture);
    onLoadRequest(): Dimensions;
    free(): void;
}
