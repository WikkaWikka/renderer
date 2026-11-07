import type { AttributeInfo } from './ShaderUtils.js';
/**
 * Number of 32-bit floats per vertex in the dynamically updated quad buffer:
 * a_position (2) + a_textureCoords (2) + a_color (1 packed 4xUint8). a_nodeCoords
 * lives in a separate static buffer shared by all BufferCollections.
 */
export declare const QUAD_VERTEX_STRIDE = 5;
export interface BufferItem {
    readonly buffer: WebGLBuffer;
    readonly attributes: Readonly<Record<string, Readonly<AttributeInfo>>>;
}
/**
 * A vertex attribute resolved to the buffer that holds it.
 */
export interface BufferAttribute {
    readonly buffer: WebGLBuffer;
    readonly info: Readonly<AttributeInfo>;
}
/**
 * Represents a collection of WebGL Buffers along with their associated
 * vertex attribute formats.
 *
 * @remarks
 * `config` is immutable after construction (enforced by type only, not frozen):
 * attribute lookups are resolved once here because they run per attribute on
 * every shader bind.
 *
 * The lookup table is a plain object (faster than a prototype-less one on old
 * V8), so attribute names must not collide with `Object.prototype` members
 * such as `constructor` or `toString`.
 */
export declare class BufferCollection {
    readonly config: ReadonlyArray<BufferItem>;
    private readonly attributes;
    constructor(config: ReadonlyArray<BufferItem>);
    /**
     * Get the buffer and AttributeInfo for the given attribute name if it exists.
     *
     * @param attributeName
     * @returns
     */
    getAttribute(attributeName: string): BufferAttribute | undefined;
    /**
     * Get the WebGLBuffer associated with the given attribute name if it exists.
     *
     * @param attributeName
     * @returns
     */
    getBuffer(attributeName: string): WebGLBuffer | undefined;
    /**
     * Get the AttributeInfo associated with the given attribute name if it exists.
     *
     * @param attributeName
     * @returns
     */
    getAttributeInfo(attributeName: string): Readonly<AttributeInfo> | undefined;
}
