import type { GlContextWrapper } from '../../platforms/GlContextWrapper.js';
import type { CoreShaderProgram } from '../CoreShaderProgram.js';
import type { WebGlCtxTexture } from './WebGlCtxTexture.js';
import type { WebGlRenderer, WebGlNodeRenderOp } from './WebGlRenderer.js';
import type { WebGlShaderType } from './WebGlShaderNode.js';
import { WebGlShaderNode } from './WebGlShaderNode.js';
import type { BufferCollection } from './internal/BufferCollection.js';
import { CoreNode } from '../../CoreNode.js';
import type { Dimensions } from '../../../common/CommonTypes.js';
import type { Stage } from '../../Stage.js';
/**
 * Structural surface shared by node render ops (CoreNode / CoreTextNode) and
 * batched SdfRenderOps that {@link WebGlShaderProgram.bindRenderOp} consumes.
 *
 * Node ops expose `parentFramebufferDimensions`, SdfRenderOp exposes
 * `framebufferDimensions`; `isCoreNode` picks the active one. Keeping this as
 * an interface (rather than widening to the full `WebGlRenderOp` union)
 * avoids demanding properties from StencilClipRenderOp, which is never bound
 * through this path.
 */
export interface WebGlBoundRenderOp {
    renderOpTextures: WebGlCtxTexture[];
    quadBufferCollection: BufferCollection;
    isCoreNode: boolean;
    rtt: boolean;
    parentHasRenderTexture: boolean;
    parentFramebufferDimensions?: Dimensions | null;
    framebufferDimensions?: Dimensions | null;
    stage: Stage;
    time: number;
    worldAlpha: number;
    w: number;
    h: number;
    shader: WebGlShaderNode | null;
}
export declare class WebGlShaderProgram implements CoreShaderProgram {
    private config;
    private resolvedProps;
    protected program: WebGLProgram | null;
    /**
     * Vertex Array Object
     *
     * @remarks
     * Used by WebGL2 Only
     */
    protected vao: WebGLVertexArrayObject | undefined;
    protected renderer: WebGlRenderer;
    glw: GlContextWrapper;
    protected attributeLocations: string[];
    protected uniformLocations: Record<string, WebGLUniformLocation> | null;
    protected lifecycle: Pick<WebGlShaderType, 'update' | 'canBatch'>;
    protected useSystemAlpha: boolean;
    protected useSystemDimensions: boolean;
    protected useTimeValue: boolean;
    isDestroyed: boolean;
    supportsIndexedTextures: boolean;
    /**
     * Shadow copies of system uniform values. Used by bindRenderOp to skip
     * redundant gl.uniform* calls when the value hasn't changed.
     *
     * Each gl.uniform* call crosses into the GPU-process command buffer, so
     * skipping value-identical re-uploads is a real per-op CPU saving on
     * embedded targets.
     *
     * Sentinel -1 never collides with real values (all >= 0).
     */
    private lastPixelRatio;
    private lastResolutionW;
    private lastResolutionH;
    private lastAlpha;
    private lastDimensionsW;
    private lastDimensionsH;
    private lastTime;
    /**
     * Last-bound shader uniform collection by identity reference.
     *
     * Uniform collections are created once, filled once, and shared by
     * reference across shader nodes with the same value key — so reference
     * equality implies value equality. Allows skipping the entire for-in
     * loop over uniform buckets when the same collection is already bound.
     */
    private lastBoundUniforms;
    constructor(renderer: WebGlRenderer, config: WebGlShaderType, resolvedProps: Record<string, any>);
    static createDeferred(renderer: WebGlRenderer, config: WebGlShaderType, props: Record<string, any>): WebGlShaderProgram;
    restoreContext(): void;
    disableAttribute(location: number): void;
    disableAttributes(): void;
    reuseRenderOp(node: CoreNode, currentRenderOp: WebGlNodeRenderOp): boolean;
    bindRenderOp(renderOp: WebGlBoundRenderOp): void;
    bindBufferCollection(buffer: BufferCollection): void;
    bindTextures(textures: WebGlCtxTexture[]): void;
    attach(): void;
    /**
     * Activate this program and bind a buffer collection without going through
     * the shader manager's detach/attach cycle. Used exclusively by the stencil
     * write pass so it does not disrupt the currently attached scene shader.
     *
     * The caller is responsible for restoring `shManager.attachedShader` to null
     * after the pass so the next real draw triggers a full re-attach.
     */
    bindForStencil(bufferCollection: BufferCollection): void;
    detach(): void;
    destroy(): void;
}
