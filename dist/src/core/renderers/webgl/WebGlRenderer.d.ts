import { CoreRenderer, type BufferInfo } from '../CoreRenderer.js';
import type { CoreContextTexture } from '../CoreContextTexture.js';
import { type CoreWebGlParameters, type CoreWebGlExtensions, type WebGlColor } from './internal/RendererUtils.js';
import { WebGlCtxTexture } from './WebGlCtxTexture.js';
import { Texture, type TextureCoords } from '../../textures/Texture.js';
import { BufferCollection } from './internal/BufferCollection.js';
import { type RectWithValid } from '../../lib/utils.js';
import { SdfBuffer } from './SdfBuffer.js';
import { SdfRenderOp } from './SdfRenderOp.js';
import { WebGlShaderProgram } from './WebGlShaderProgram.js';
import { CoreNode } from '../../CoreNode.js';
import type { WebGlShaderType } from './WebGlShaderNode.js';
import { WebGlShaderNode } from './WebGlShaderNode.js';
import type { Dimensions } from '../../../common/CommonTypes.js';
import type { GlContextWrapper } from '../../platforms/GlContextWrapper.js';
import type { Stage } from '../../Stage.js';
import type { CoreTextNode } from '../../CoreTextNode.js';
interface CoreWebGlSystem {
    parameters: CoreWebGlParameters;
    extensions: CoreWebGlExtensions;
}
/**
 * Pre-allocated sentinel op inserted into the renderOps array to bracket the
 * child quads of a node that uses rounded-corner stencil clipping.
 *
 * `kind === 0` = begin stencil write pass (before children)
 * `kind === 1` = end stencil region (after children)
 *
 * Objects are reused from a pool on WebGlRenderer — never heap-allocated per frame.
 */
export declare class StencilClipRenderOp {
    kind: 0 | 1;
    x: number;
    y: number;
    w: number;
    h: number;
    clipRadius: number;
    pixelRatio: number;
    canvasHeight: number;
    parentHasRenderTexture: boolean;
    parentFramebufferH: number;
    stencilRef: number;
}
export type WebGlNodeRenderOp = CoreNode | CoreTextNode;
export type WebGlRenderOp = WebGlNodeRenderOp | StencilClipRenderOp | SdfRenderOp;
export declare class WebGlRenderer extends CoreRenderer {
    glw: GlContextWrapper;
    private _system;
    /**
     * GPU parameters and extensions, enumerated lazily on first access.
     * The enumeration issues hundreds of synchronous GL queries, so it is kept
     * out of the constructor (startup path). First consumer is the default
     * shader build on the first rendered frame.
     */
    get system(): CoreWebGlSystem;
    quadBuffer: ArrayBuffer;
    fQuadBuffer: Float32Array;
    uiQuadBuffer: Uint32Array;
    renderOps: WebGlRenderOp[];
    curBufferIdx: number;
    curRenderOp: WebGlRenderOp | null;
    rttNodes: CoreNode[];
    activeRttNode: CoreNode | null;
    needsFullUpload: boolean;
    lastUploadedBufferSize: number;
    dirtyQuadCount: number;
    rttQuadBuffer: ArrayBuffer | null;
    fRttQuadBuffer: Float32Array | null;
    uiRttQuadBuffer: Uint32Array | null;
    private readonly _quadScratchBuffer;
    private readonly _quadScratchU;
    /**
     * Whether surgical dirty-quad repaints (PR #861) are enabled.
     *
     * @remarks
     * Construction-time only via `enableDirtyRepaints` (default `true`).
     * When disabled, `addQuad`/`render`/`renderRTTNodes` use the legacy full
     * buffer upload path and all slot/dirty bookkeeping stays inert.
     */
    private readonly useDirtyRepaints;
    /**
     * Shared SDF vertex buffers — one per GPU layout.
     *
     * All SDF text of a given layout writes into a single pre-allocated CPU
     * buffer that is uploaded to the GPU in one `bufferData` per frame. Compatible
     * consecutive text nodes are merged into a single SdfRenderOp, producing one
     * draw call for many strings.
     *
     * The two layouts have different strides (6 floats plain / 7 floats rich) and
     * can therefore never share a draw call; each gets its own buffer, and each
     * SdfRenderOp carries the SdfBuffer it draws from.
     *
     * Created lazily on first SDF text render to keep renderer construction
     * (startup path) lean; apps without early text never pay for them.
     */
    private _sdfBufferPlain;
    private _sdfBufferRich;
    get sdfBufferPlain(): SdfBuffer;
    set sdfBufferPlain(buffer: SdfBuffer);
    get sdfBufferRich(): SdfBuffer;
    set sdfBufferRich(buffer: SdfBuffer);
    /**
     * Current SDF render op being extended by `finalizeSdfBatch`. Null when the
     * last op is not extendable (different atlas, clipping rect, or RTT state).
     */
    curSdfRenderOp: SdfRenderOp | null;
    defaultTextureCoords: TextureCoords;
    defaultShaderNode: WebGlShaderNode | null;
    private shaderPrograms;
    quadBufferCollection: BufferCollection;
    stencilClipProgram: WebGlShaderProgram | null;
    stencilDepth: number;
    private stencilQuadBufferCollection;
    private stencilOpPool;
    private stencilOpPoolIdx;
    private readonly _stencilScratchBuffer;
    private readonly _stencilScratchF;
    private readonly _stencilScratchU;
    clearColor: WebGlColor;
    /**
     * White pixel texture used by default when no texture is specified.
     */
    quadBufferUsage: number;
    numQuadsRendered: number;
    /**
     * Whether the renderer is currently rendering to a texture.
     */
    renderToTextureActive: boolean;
    constructor(stage: Stage);
    restoreContext(): void;
    private initializeContext;
    reset(): void;
    createShaderProgram(shaderType: WebGlShaderType, props: Record<string, unknown>): WebGlShaderProgram;
    untrackShaderProgram(program: WebGlShaderProgram): void;
    restoreShaderPrograms(): void;
    createShaderNode(shaderKey: string, shaderType: WebGlShaderType, props?: Record<string, unknown>, program?: WebGlShaderProgram): WebGlShaderNode<Record<string, unknown>>;
    supportsShaderType(shaderType: Readonly<WebGlShaderType>): boolean;
    createCtxTexture(textureSource: Texture): CoreContextTexture;
    /**
     * This function adds a quad (a rectangle composed of two triangles) to the WebGL rendering pipeline.
     *
     * It takes a set of options that define the quad's properties, such as its dimensions, colors, texture, shader, and transformation matrix.
     * The function first updates the shader properties with the current dimensions if necessary, then sets the default texture if none is provided.
     * It then checks if a new render operation is needed, based on the current shader and clipping rectangle.
     * If a new render operation is needed, it creates one and updates the current render operation.
     * The function then adjusts the texture coordinates based on the texture options and adds the texture to the texture manager.
     *
     * Finally, it calculates the vertices for the quad, taking into account any transformations, and adds them to the quad buffer.
     * The function updates the length and number of quads in the current render operation, and updates the current buffer index.
     */
    addQuad(node: CoreNode): void;
    /**
     * Replace the existing RenderOp with a new one that uses the specified Shader
     * and starts at the specified buffer index.
     *
     * @param shader
     * @param bufferIdx
     */
    private newRenderOp;
    /**
     * Test if the current Render operation can be reused for the specified parameters.
     * @param params
     * @returns
     */
    reuseRenderOp(node: CoreNode): boolean;
    /**
     * add RenderOp to the render pipeline
     */
    addRenderOp(renderable: WebGlRenderOp): void;
    /**
     * Append pre-transformed SDF glyph vertices to the given shared SDF buffer
     * and manage SDF render op batching.
     *
     * @remarks
     * This method pre-transforms glyph positions from design units to world
     * pixel space on the CPU, packs per-vertex color and distanceRange, and
     * writes them into the shared SDF buffer of the given layout. Compatible
     * consecutive calls (same layout, atlas, clipping, RTT state) are merged
     * into a single SdfRenderOp, resulting in one draw call for many text nodes.
     *
     * The design-unit glyph records are `SDF_PLAIN_GLYPH_STRIDE` (8) or
     * `SDF_RICH_GLYPH_STRIDE` (12) floats per glyph depending on the layout:
     *   plain: x, y, w, h, u, v, uw, vh
     *   rich:  x, y, w, h, u, v, uw, vh, shearTop, shearBot, packed_span_color, style
     * where packed_span_color is RGBA bytes written via a Uint32 view of the
     * same ArrayBuffer (bit-identical read via `uGlyphs` below), shearTop/shearBot
     * are the per-corner x-deltas of the italic lean, and the decorated quads use
     * `u = -1.0` as a solid-fill sentinel.
     */
    addSdfQuads(sdfBuffer: SdfBuffer, glyphs: Float32Array, glyphCount: number, fontScale: number, transform: Float32Array, color: number, worldAlpha: number, distanceRange: number, atlasTexture: WebGlCtxTexture, clippingRect: RectWithValid, width: number, height: number, parentHasRenderTexture: boolean, framebufferDimensions: Dimensions | null, sdfShader: WebGlShaderNode): void;
    /**
     * Fast path: copy pre-computed cached SDF vertex data into the shared
     * buffer and create/extend an SdfRenderOp.
     *
     * @remarks
     * When a text node hasn't changed (same layout, transform, color, alpha),
     * the per-glyph matrix multiplication is skipped entirely. The cached
     * Float32Array is written via a single `Float32Array.set()` (memcpy), which
     * is orders of magnitude faster than the per-glyph computation path.
     *
     * The cached data is already in the target SdfBuffer's GPU layout, so the
     * mem-copy must stay a typed-array `set` (bit-exact): packed RGBA colors
     * live in the same Float32Array and some bit patterns are float32 NaNs,
     * which element-wise float reads/writes may canonicalize and corrupt.
     *
     * Exact cache hits write byte-identical data at identical offsets, so this
     * path deliberately does NOT set `sdfBuffer.changed`.
     */
    addSdfCachedQuads(sdfBuffer: SdfBuffer, cachedVertices: Float32Array, numGlyphs: number, atlasTexture: WebGlCtxTexture, clippingRect: RectWithValid, worldAlpha: number, width: number, height: number, parentHasRenderTexture: boolean, framebufferDimensions: Dimensions | null, sdfShader: WebGlShaderNode): void;
    /**
     * Append cached SDF vertices translated by (dx, dy) to the shared buffer.
     *
     * @remarks
     * The scroll fast path: a text node whose transform changed by pure
     * translation reuses its world-space vertex cache — one mem-copy plus two
     * adds per vertex instead of full per-glyph matrix math, and the cache
     * keeps its original base so nothing is re-snapshotted per frame.
     *
     * The copy MUST stay a typed-array `set` (bit-exact memcpy): packed RGBA
     * colors live in the same Float32Array and some bit patterns are float32
     * NaNs, which element-wise float reads/writes may canonicalize and corrupt.
     * Only the two position floats of each vertex are touched after the copy.
     */
    addSdfTranslatedQuads(sdfBuffer: SdfBuffer, cachedVertices: Float32Array, numGlyphs: number, dx: number, dy: number, atlasTexture: WebGlCtxTexture, clippingRect: RectWithValid, worldAlpha: number, width: number, height: number, parentHasRenderTexture: boolean, framebufferDimensions: Dimensions | null, sdfShader: WebGlShaderNode): void;
    /**
     * Shared batching logic for SDF render ops.
     * Called by all `addSdf*` write paths.
     */
    private finalizeSdfBatch;
    /**
     * Upload the shared SDF buffers for the main pass, skipping the driver-side
     * `bufferData` copy per layout when its bytes provably match what the GPU
     * already holds: every write this frame was an exact cache-hit mem-copy
     * (`changed` false) and the total size matches the previous upload.
     *
     * The skip is only sound because a cache hit that is NOT byte-identical to
     * the current GPU contents always raises `changed`:
     * - cache-miss recompute (`addSdfQuads`) and translated copies
     *   (`addSdfTranslatedQuads`) write fresh bytes;
     * - `renderQuads` marks the buffer dirty when a static cache hit would land
     *   at a shifted offset (a render-list reorder moves the node's quad range)
     *   or when the last write at that range was a translated copy;
     * - backing-store growth swaps the ArrayBuffer, and RTT partial uploads
     *   have their own dirty path.
     */
    private uploadSdfBuffer;
    private uploadSdfBufferLayout;
    /**
     * Render the current set of RenderOps to render to the specified surface.
     *
     * TODO: 'screen' is the only supported surface at the moment.
     *
     * @param surface
     */
    render(_surface?: 'screen' | CoreContextTexture): void;
    private uploadFullBuffer;
    private uploadFullDirty;
    private uploadSurgicalQuads;
    getQuadCount(): number;
    renderToTexture(node: CoreNode): void;
    /**
     * Inserts an RTT node into `this.rttNodes` while maintaining the correct rendering order based on hierarchy.
     *
     * Rendering order for RTT nodes is critical when nested RTT nodes exist in a parent-child relationship.
     * Specifically:
     *  - Child RTT nodes must be rendered before their RTT-enabled parents to ensure proper texture composition.
     *  - If an RTT node is added and it has existing RTT children, it should be rendered after those children.
     *
     * This function addresses both cases by:
     * 1. **Checking Upwards**: It traverses the node's hierarchy upwards to identify any RTT parent
     *    already in `rttNodes`. If an RTT parent is found, the new node is placed before this parent.
     * 2. **Checking Downwards**: It traverses the node’s children recursively to find any RTT-enabled
     *    children that are already in `rttNodes`. If such children are found, the new node is inserted
     *    after the last (highest index) RTT child node.
     *
     * The final calculated insertion index ensures the new node is positioned in `rttNodes` to respect
     * both parent-before-child and child-before-parent rendering rules, preserving the correct order
     * for the WebGL renderer.
     *
     * @param node - The RTT-enabled CoreNode to be added to `rttNodes` in the appropriate hierarchical position.
     */
    private insertRTTNodeInOrder;
    private findMaxChildRTTIndex;
    renderRTTNodes(): void;
    private renderRTT;
    updateViewport(): void;
    removeRTTNode(node: CoreNode): void;
    invalidateQuadBuffer(): void;
    getBufferInfo(): BufferInfo | null;
    getDefaultShaderNode(): WebGlShaderNode;
    getTextureCoords(node: CoreNode): TextureCoords | undefined;
    /**
     * Sets the glClearColor to the specified color.   *
     * @param color - The color to set as the clear color, represented as a 32-bit integer.
     */
    updateClearColor(color: number): void;
    /**
     * Lazily compiles the StencilClip shader program (once per renderer lifetime).
     */
    private getStencilClipProgram;
    /**
     * Returns a pre-allocated StencilClipRenderOp from the pool, growing the pool
     * if necessary. Pool objects are never GC'd between frames.
     */
    private allocStencilOp;
    /**
     * Inserts a "begin rounded clip" sentinel into renderOps for the given node.
     * Called by Stage.addQuads before processing a rounded-clip node's children.
     */
    beginRoundedClip(node: CoreNode): void;
    /**
     * Inserts an "end rounded clip" sentinel into renderOps for the given node.
     * Called by Stage.addSubtreeQuads after processing a rounded-clip node's children.
     */
    endRoundedClip(_node: CoreNode): void;
    /**
     * Executes the stencil write pass for a begin-rounded-clip sentinel.
     * Sets stencil test so subsequent draws are masked to the rounded region.
     */
    private drawStencilBegin;
    /**
     * Tears down the stencil state after the rounded-clip subtree has been drawn.
     */
    private drawStencilEnd;
    destroy(): void;
    deleteBuffer(buffer: WebGLBuffer): void;
}
export {};
