import type { CoreNode } from '../../../CoreNode.js';
import type { TextureCoords } from '../../../textures/Texture.js';
import type { RectWithValid } from '../../../lib/utils.js';
export declare const WEBGPU_FLOATS_PER_VERTEX = 8;
export declare const WEBGPU_VERTICES_PER_QUAD = 6;
export declare const WEBGPU_FLOATS_PER_QUAD: number;
export declare const writeWebGpuQuad: (target: Float32Array, offset: number, node: CoreNode, textureCoords: TextureCoords, canvasWidth: number, canvasHeight: number, pixelRatio: number) => void;
export interface WebGpuScissorRect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare const toWebGpuScissorRect: (rect: RectWithValid, canvasWidth: number, canvasHeight: number, pixelRatio: number) => WebGpuScissorRect;
export declare const rgbaToGpuColor: (rgba: number) => GPUColor;
