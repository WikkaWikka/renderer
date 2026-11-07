import type { CoreNode } from '../../CoreNode.js';
import { type Texture } from '../../textures/Texture.js';
import type { CoreContextTexture } from '../CoreContextTexture.js';
import { CoreRenderer } from '../CoreRenderer.js';
import { CanvasShaderNode, type CanvasShaderType } from './CanvasShaderNode.js';
import type { Stage } from '../../Stage.js';
export declare class CanvasRenderer extends CoreRenderer {
    private context;
    private canvas;
    private pixelRatio;
    private clearColor;
    renderToTextureActive: boolean;
    activeRttNode: CoreNode | null;
    constructor(stage: Stage);
    reset(): void;
    render(): void;
    addQuad(node: CoreNode): void;
    renderContext(node: CoreNode, texture: Texture): void;
    createShaderNode(shaderKey: string, shaderType: Readonly<CanvasShaderType>, props?: Record<string, any>): CanvasShaderNode<Record<string, any>, Record<string, unknown>>;
    createShaderProgram(_shaderConfig: any): null;
    supportsShaderType(shaderType: Readonly<CanvasShaderType>): boolean;
    createCtxTexture(textureSource: Texture): CoreContextTexture;
    renderRTTNodes(): void;
    removeRTTNode(_node: CoreNode): void;
    renderToTexture(_node: CoreNode): void;
    getBufferInfo(): null;
    getQuadCount(): null;
    /**
     * Updates the clear color of the canvas renderer.
     *
     * @param color - The color to set as the clear color.
     */
    updateClearColor(color: number): void;
    updateViewport(): void;
    getDefaultShaderNode(): null;
    destroy(): void;
}
