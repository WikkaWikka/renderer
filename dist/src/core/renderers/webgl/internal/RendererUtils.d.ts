import type { GlContextWrapper } from '../../../platforms/GlContextWrapper.js';
export interface CoreWebGlParameters {
    MAX_RENDERBUFFER_SIZE: number;
    MAX_TEXTURE_SIZE: number;
    MAX_VIEWPORT_DIMS: Int32Array;
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: number;
    MAX_TEXTURE_IMAGE_UNITS: number;
    MAX_COMBINED_TEXTURE_IMAGE_UNITS: number;
    MAX_VERTEX_ATTRIBS: number;
    MAX_VARYING_VECTORS: number;
    MAX_VERTEX_UNIFORM_VECTORS: number;
    MAX_FRAGMENT_UNIFORM_VECTORS: number;
}
/**
 * Get device specific webgl parameters
 * @param glw
 */
export declare function getWebGlParameters(glw: GlContextWrapper): CoreWebGlParameters;
export interface CoreWebGlExtensions {
    ANGLE_instanced_arrays: ANGLE_instanced_arrays | null;
    WEBGL_compressed_texture_s3tc: WEBGL_compressed_texture_s3tc | null;
    WEBGL_compressed_texture_astc: WEBGL_compressed_texture_astc | null;
    WEBGL_compressed_texture_etc: WEBGL_compressed_texture_etc | null;
    WEBGL_compressed_texture_etc1: WEBGL_compressed_texture_etc1 | null;
    WEBGL_compressed_texture_pvrtc: any | null;
    WEBKIT_WEBGL_compressed_texture_pvrtc: any | null;
    WEBGL_compressed_texture_s3tc_srgb: WEBGL_compressed_texture_s3tc_srgb | null;
    OES_vertex_array_object: OES_vertex_array_object | null;
}
/**
 * Get device webgl extensions
 * @param glw
 */
export declare function getWebGlExtensions(glw: GlContextWrapper): CoreWebGlExtensions;
/**
 * Number of quads that can be drawn from the shared index buffer for a given
 * buffer memory budget.
 *
 * @param bufferMemory
 */
export declare function getMaxQuads(bufferMemory: number): number;
/**
 * Allocate big memory chunk that we
 * can re-use to draw quads
 *
 * @param glw
 * @param size
 */
export declare function createIndexBuffer(glw: GlContextWrapper, size: number): void;
/**
 * Checks if an object is of type HTMLImageElement.
 * This is used because we cant check for HTMLImageElement directly when the
 * renderer is running in a seperate web worker context.
 *
 * @param obj
 * @returns
 */
export declare function isHTMLImageElement(obj: unknown): obj is HTMLImageElement;
export interface WebGlColor {
    raw: number;
    normalized: [number, number, number, number];
}
