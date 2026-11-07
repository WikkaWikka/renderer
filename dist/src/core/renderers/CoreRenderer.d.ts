import type { CoreNode } from '../CoreNode.js';
import type { Stage } from '../Stage.js';
import type { CoreShaderProgram } from './CoreShaderProgram.js';
import type { Texture, TextureCoords } from '../textures/Texture.js';
import { CoreContextTexture } from './CoreContextTexture.js';
import type { CoreShaderType, CoreShaderNode } from './CoreShaderNode.js';
export interface BufferInfo {
    totalUsed: number;
    totalAvailable: number;
}
export type CoreRendererConstructor = new (stage: Stage) => CoreRenderer;
export declare abstract class CoreRenderer {
    mode: 'webgl' | 'canvas' | 'halti' | undefined;
    defaultTextureCoords: TextureCoords | undefined;
    readonly stage: Stage;
    rttNodes: CoreNode[];
    constructor(stage: Stage);
    abstract reset(): void;
    abstract render(surface?: 'screen' | CoreContextTexture): void;
    abstract addQuad(node: CoreNode): void;
    abstract createCtxTexture(textureSource: Texture): CoreContextTexture;
    abstract createShaderProgram(shaderConfig: Readonly<CoreShaderType>, props?: Record<string, unknown>): CoreShaderProgram | null;
    abstract createShaderNode(shaderKey: string, shaderType: Readonly<CoreShaderType>, props?: Record<string, unknown>, program?: CoreShaderProgram): CoreShaderNode;
    abstract supportsShaderType(shaderType: Readonly<CoreShaderType>): boolean;
    abstract getDefaultShaderNode(): CoreShaderNode | null;
    abstract get renderToTextureActive(): boolean;
    abstract get activeRttNode(): CoreNode | null;
    abstract renderRTTNodes(): void;
    abstract removeRTTNode(node: CoreNode): void;
    abstract renderToTexture(node: CoreNode): void;
    abstract getBufferInfo(): BufferInfo | null;
    abstract getQuadCount(): number | null;
    abstract updateViewport(): void;
    abstract updateClearColor(color: number): void;
    abstract destroy(): void;
    restoreContext?(): void;
    restoreShaderPrograms?(): void;
    getTextureCoords?(node: CoreNode): TextureCoords | undefined;
    invalidateQuadBuffer?(): void;
    /**
     * Delete a GPU buffer previously allocated by this renderer.
     * No-op for renderers that do not use WebGL buffers (e.g. Canvas).
     */
    deleteBuffer(_buffer: WebGLBuffer): void;
    /**
     * Insert a begin-rounded-clip sentinel into the render op list before a
     * node's children are added. No-op on non-WebGL renderers.
     */
    beginRoundedClip(_node: CoreNode): void;
    /**
     * Insert an end-rounded-clip sentinel after a node's children have been
     * added. No-op on non-WebGL renderers.
     */
    endRoundedClip(_node: CoreNode): void;
}
