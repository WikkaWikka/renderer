import { CoreRenderOp } from '../CoreRenderOp.js';
import type { WebGlCtxTexture } from './WebGlCtxTexture.js';
import type { WebGlRenderer } from './WebGlRenderer.js';
import type { SdfBuffer } from './SdfBuffer.js';
import type { WebGlShaderNode } from './WebGlShaderNode.js';
import type { RectWithValid } from '../../lib/utils.js';
import type { Dimensions } from '../../../common/CommonTypes.js';
import type { Stage } from '../../Stage.js';
/**
 * A batched SDF text render operation.
 *
 * Rather than owning its own WebGL buffer, this op references a range inside
 * one of the renderer's shared SDF vertex buffers (a {@link SdfBuffer}). Text
 * nodes that share the same atlas texture, clipping rect, and RTT state are
 * merged into a single SdfRenderOp, producing one draw call for many strings.
 *
 * `startQuad` is 0-based within the owning SdfBuffer. The shared element index
 * buffer holds the standard quad index pattern starting at index 0, so the
 * draw range is `startQuad * 6 * 2` bytes regardless of which SdfBuffer (and
 * therefore which GPU layout) this op draws from.
 */
export declare class SdfRenderOp extends CoreRenderOp {
    readonly renderer: WebGlRenderer;
    readonly shader: WebGlShaderNode;
    readonly sdfBuffer: SdfBuffer;
    readonly worldAlpha: number;
    readonly clippingRect: RectWithValid;
    readonly w: number;
    readonly h: number;
    readonly rtt: boolean;
    parentHasRenderTexture: boolean;
    framebufferDimensions: Dimensions | null;
    numQuads: number;
    readonly isCoreNode: false;
    renderOpTextures: WebGlCtxTexture[];
    time: number;
    readonly stage: Stage;
    /**
     * Index of the first quad of this batch within the owning SdfBuffer.
     * Used to compute the byte offset into the shared element index buffer.
     */
    startQuad: number;
    constructor(renderer: WebGlRenderer, shader: WebGlShaderNode, sdfBuffer: SdfBuffer, worldAlpha: number, clippingRect: RectWithValid, w: number, h: number, rtt: boolean, parentHasRenderTexture: boolean, framebufferDimensions: Dimensions | null);
    get quadBufferCollection(): import("./internal/BufferCollection.js").BufferCollection;
    addTexture(texture: WebGlCtxTexture): number;
    draw(): void;
}
