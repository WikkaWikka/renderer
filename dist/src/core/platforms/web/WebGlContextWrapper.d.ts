import type { Vec2, Vec3, Vec4 } from '../../renderers/webgl/internal/ShaderUtils.js';
import { GlContextWrapper } from '../GlContextWrapper.js';
import type { CompressedData } from '../../textures/Texture.js';
/**
 * Optimized WebGL Context Wrapper
 *
 * @remarks
 * This class contains the subset of the WebGLRenderingContext & WebGL2RenderingContext
 * API that is used by the renderer. Select high volume WebGL methods include
 * caching optimizations to avoid making WebGL calls if the state is already set
 * to the desired value.
 *
 * While most methods contained are direct passthroughs to the WebGL context,
 * some methods combine multiple WebGL calls into one for convenience, modify
 * arguments to be more convenient, or are replaced by more specific methods.
 *
 * Not all methods are optimized. Only methods that are called frequently
 * and/or have a high cost are optimized.
 *
 * A subset of GLenum constants are also exposed as properties on this class
 * for convenience.
 */
export declare class WebGlContextWrapper extends GlContextWrapper {
    private gl;
    private activeTextureUnit;
    private texture2dUnits;
    private texture2dParams;
    private scissorEnabled;
    private scissorX;
    private scissorY;
    private scissorWidth;
    private scissorHeight;
    private stencilTestEnabled;
    private stencilFuncMode;
    private stencilFuncRef;
    private stencilFuncMask;
    private stencilOpFail;
    private stencilOpZFail;
    private stencilOpZPass;
    private stencilMaskValue;
    private colorMaskR;
    private colorMaskG;
    private colorMaskB;
    private colorMaskA;
    private blendEnabled;
    private blendSrcRgb;
    private blendDstRgb;
    private blendSrcAlpha;
    private blendDstAlpha;
    private boundArrayBuffer;
    private boundElementArrayBuffer;
    private curProgram;
    private curUniformLocations;
    /**
     * Memoized `gl.getExtension()` results (including `null` for unsupported).
     * `getExtension()` activates the extension's enums driver-side, so caching
     * the lookup avoids repeat JS->native bridge calls on every compressed
     * texture upload. Lifetime is tied to this wrapper instance, which is
     * recreated with the GL context, so no stale entries across contexts.
     */
    private extCache;
    readonly canvas: any;
    readonly MAX_RENDERBUFFER_SIZE: any;
    readonly MAX_TEXTURE_SIZE: any;
    readonly MAX_VIEWPORT_DIMS: any;
    readonly MAX_VERTEX_TEXTURE_IMAGE_UNITS: any;
    readonly MAX_TEXTURE_IMAGE_UNITS: any;
    readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS: any;
    readonly MAX_VERTEX_ATTRIBS: any;
    readonly MAX_VARYING_VECTORS: any;
    readonly MAX_VERTEX_UNIFORM_VECTORS: any;
    readonly MAX_FRAGMENT_UNIFORM_VECTORS: any;
    readonly TEXTURE_MAG_FILTER: any;
    readonly TEXTURE_MIN_FILTER: any;
    readonly TEXTURE_WRAP_S: any;
    readonly TEXTURE_WRAP_T: any;
    readonly LINEAR: any;
    readonly LINEAR_MIPMAP_LINEAR: any;
    readonly CLAMP_TO_EDGE: any;
    readonly RGB: any;
    readonly RGBA: any;
    readonly UNSIGNED_BYTE: any;
    readonly UNPACK_PREMULTIPLY_ALPHA_WEBGL: any;
    readonly UNPACK_FLIP_Y_WEBGL: any;
    readonly FLOAT: any;
    readonly TRIANGLES: any;
    readonly UNSIGNED_SHORT: any;
    readonly ONE: any;
    readonly ONE_MINUS_SRC_ALPHA: any;
    readonly VERTEX_SHADER: any;
    readonly FRAGMENT_SHADER: any;
    readonly STATIC_DRAW: any;
    readonly COMPILE_STATUS: any;
    readonly LINK_STATUS: any;
    readonly DYNAMIC_DRAW: any;
    readonly COLOR_ATTACHMENT0: any;
    readonly INVALID_ENUM: number;
    readonly INVALID_OPERATION: number;
    readonly STENCIL_TEST: number;
    readonly ALWAYS: number;
    readonly EQUAL: number;
    readonly KEEP: number;
    readonly REPLACE: number;
    readonly INCR: number;
    readonly DECR: number;
    readonly STENCIL_BUFFER_BIT: number;
    readonly isWebGl2: boolean;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
    /**
     * ```
     * gl.activeTexture(textureUnit + gl.TEXTURE0);
     * ```
     *
     * @remarks
     * **WebGL Difference**: `textureUnit` is based from 0, not `gl.TEXTURE0`.
     *
     * @param textureUnit
     */
    activeTexture(textureUnit: number): void;
    /**
     * ```
     * gl.bindTexture(gl.TEXTURE_2D, texture);
     * ```
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     *
     * @param texture
     */
    bindTexture(texture: WebGLTexture | null): void;
    private _getActiveTexture;
    /**
     * ```
     * gl.texParameteri(gl.TEXTURE_2D, pname, param);
     * ```
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     *
     * @param pname
     * @param param
     * @returns
     */
    texParameteri(pname: number, param: number): void;
    /**
     * ```
     * gl.texImage2D(
     *   gl.TEXTURE_2D,
     *   level,
     *   internalFormat,
     *   width,
     *   height,
     *   border,
     *   format,
     *   type,
     *   pixels,
     * );
     * ```
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     *
     * @param level
     * @param internalFormat
     * @param width
     * @param height
     * @param border
     * @param format
     * @param type
     * @param pixels
     */
    texImage2D(level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;
    texImage2D(level: GLint, internalformat: GLint, format: GLenum, type: GLenum, source: TexImageSource | Uint8Array): void;
    /**
     * ```
     * gl.compressedTexImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, data);
     * ```
     *
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     */
    compressedTexImage2D(level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, border: GLint, data?: ArrayBufferView): void;
    /**
     * ```
     * gl.pixelStorei(pname, param);
     * ```
     *
     * @param pname
     * @param param
     */
    pixelStorei(pname: GLenum, param: GLint | GLboolean): void;
    /**
     * ```
     * gl.generateMipmap(gl.TEXTURE_2D);
     * ```
     *
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     */
    generateMipmap(): void;
    /**
     * ```
     * gl.createTexture();
     * ```
     *
     * @returns
     */
    createTexture(): WebGLTexture;
    /**
     * ```
     * gl.deleteTexture(texture);
     * ```
     *
     * @param texture
     */
    deleteTexture(texture: WebGLTexture | null): void;
    /**
     * ```
     * gl.deleteFramebuffer(framebuffer);
     *
     * @param framebuffer
     */
    deleteFramebuffer(framebuffer: WebGLFramebuffer | null): void;
    /**
     * ```
     * gl.viewport(x, y, width, height);
     * ```
     */
    viewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void;
    /**
     * ```
     * gl.clearColor(red, green, blue, alpha);
     * ```
     *
     * @param red
     * @param green
     * @param blue
     * @param alpha
     */
    clearColor(red: GLclampf, green: GLclampf, blue: GLclampf, alpha: GLclampf): void;
    /**
     * ```
     * gl["enable"|"disable"](gl.SCISSOR_TEST);
     * ```
     * @param enable
     */
    setScissorTest(enable: boolean): void;
    /**
     * ```
     * gl.scissor(x, y, width, height);
     * ```
     *
     * @param x
     * @param y
     * @param width
     * @param height
     */
    scissor(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void;
    /**
     * ```
     * gl["enable"|"disable"](gl.BLEND);
     * ```
     *
     * @param blend
     * @returns
     */
    setBlend(blend: boolean): void;
    setStencilTest(enable: boolean): void;
    stencilFunc(func: GLenum, ref: GLint, mask: GLuint): void;
    stencilOp(fail: GLenum, zfail: GLenum, zpass: GLenum): void;
    stencilMask(mask: GLuint): void;
    clearStencil(s: GLint): void;
    colorMask(r: GLboolean, g: GLboolean, b: GLboolean, a: GLboolean): void;
    /**
     * ```
     * gl.blendFunc(src, dst);
     * ```
     *
     * @param src
     * @param dst
     */
    blendFunc(src: GLenum, dst: GLenum): void;
    /**
     * ```
     * gl.createBuffer();
     * ```
     *
     * @returns
     */
    createBuffer(): WebGLBuffer;
    /**
     * ```
     * gl.createFramebuffer();
     * ```
     * @returns
     */
    createFramebuffer(): WebGLFramebuffer;
    /**
     * ```
     * gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
     * ```
     *
     * @param framebuffer
     */
    bindFramebuffer(framebuffer: WebGLFramebuffer | null): void;
    /**
     * ```
     * gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
     * ```
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.FRAMEBUFFER` and textarget is always `gl.TEXTURE_2D`
     */
    framebufferTexture2D(attachment: GLenum, texture: WebGLTexture | null, level: GLint): void;
    /**
     * ```
     * gl.clear(gl.COLOR_BUFFER_BIT);
     * ```
     *
     * @remarks
     * **WebGL Difference**: Clear mask is always `gl.COLOR_BUFFER_BIT`
     */
    clear(): void;
    /**
     * ```
     * gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
     * gl.bufferData(gl.ARRAY_BUFFER, data, usage);
     * ```
     *
     * @remarks
     * **WebGL Combo**: `gl.bindBuffer` and `gl.bufferData` are combined into one function.
     *
     * @param buffer
     * @param data
     * @param usage
     */
    arrayBufferData(buffer: WebGLBuffer | null, data: ArrayBufferView, usage: GLenum): void;
    arrayBufferSubData(buffer: WebGLBuffer | null, dstByteOffset: GLintptr, data: ArrayBufferView): void;
    /**
     * ```
     * gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
     * gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage);
     * ```
     * @remarks
     * **WebGL Combo**: `gl.bindBuffer` and `gl.bufferData` are combined into one function.
     *
     * @param buffer
     * @param data
     * @param usage
     */
    elementArrayBufferData(buffer: WebGLBuffer | null, data: ArrayBufferView, usage: GLenum): void;
    /**
     * ```
     * gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
     * gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
     * ```
     *
     * @remarks
     * **WebGL Combo**: `gl.bindBuffer` and `gl.vertexAttribPointer` are combined into one function.
     *
     * @param buffer
     * @param index
     * @param size
     * @param type
     * @param normalized
     * @param stride
     * @param offset
     */
    vertexAttribPointer(buffer: WebGLBuffer, index: GLuint, size: GLint, type: GLenum, normalized: GLboolean, stride: GLsizei, offset: GLintptr): void;
    /**
     * Returns object with Attribute names as key and numbers as location values
     *
     * @param program
     * @returns object with numbers
     */
    getUniformLocations(program: WebGLProgram): Record<string, WebGLUniformLocation>;
    /**
     * Returns object with Attribute names as key and numbers as location values
     * @param program
     * @returns object with numbers
     */
    getAttributeLocations(program: WebGLProgram): string[];
    /**
     * ```
     * gl.useProgram(program);
     * ```
     *
     * @param program
     * @returns
     */
    useProgram(program: WebGLProgram | null, uniformLocations: Record<string, WebGLUniformLocation>): void;
    /**
     * Sets the value of a single float uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The value to set.
     */
    uniform1f(location: string, v0: number): void;
    /**
     * Sets the value of a float array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of values to set.
     */
    uniform1fv(location: string, value: Float32Array): void;
    /**
     * Sets the value of a single integer uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The value to set.
     */
    uniform1i(location: string, v0: number): void;
    /**
     * Sets the value of an integer array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of values to set.
     */
    uniform1iv(location: string, value: Int32Array): void;
    /**
     * Sets the value of a vec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     */
    uniform2f(location: string, v0: number, v1: number): void;
    /**
     * Sets the value of a vec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v - array of 2 numbers.
     */
    uniform2fa(location: string, value: Vec2): void;
    /**
     * Sets the value of a vec2 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec2 values to set.
     */
    uniform2fv(location: string, value: Float32Array): void;
    /**
     * Sets the value of a ivec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     */
    uniform2i(location: string, v0: number, v1: number): void;
    /**
     * Sets the value of an ivec2 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec2 values to set.
     */
    uniform2iv(location: string, value: Int32Array): void;
    /**
     * Sets the value of a vec3 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     */
    uniform3f(location: string, v0: number, v1: number, v2: number): void;
    /**
     * Sets the value of a vec3 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v - array of 3 numbers.
     */
    uniform3fa(location: string, value: Vec3): void;
    /**
     * Sets the value of a vec3 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec3 values to set.
     */
    uniform3fv(location: string, value: Float32Array): void;
    /**
     * Sets the value of a ivec3 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     */
    uniform3i(location: string, v0: number, v1: number, v2: number): void;
    /**
     * Sets the value of an ivec3 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec3 values to set.
     */
    uniform3iv(location: string, value: Int32Array): void;
    /**
     * Sets the value of a vec4 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     * @param v3 - The fourth component of the vector.
     */
    uniform4f(location: string, v0: number, v1: number, v2: number, v3: number): void;
    /**
     * Sets the value of a vec4 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v - array of 4 numbers.
     */
    uniform4fa(location: string, value: Vec4): void;
    /**
     * Sets the value of a vec4 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec4 values to set.
     */
    uniform4fv(location: string, value: Float32Array): void;
    /**
     * Sets the value of a ivec4 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     * @param v3 - The fourth component of the vector.
     */
    uniform4i(location: string, v0: number, v1: number, v2: number, v3: number): void;
    /**
     * Sets the value of an ivec4 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec4 values to set.
     */
    uniform4iv(location: string, value: Int32Array): void;
    /**
     * Sets the value of a mat2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param transpose - Whether to transpose the matrix.
     * @param value - The array of mat2 values to set.
     */
    uniformMatrix2fv(location: string, value: Float32Array): void;
    /**
     * Sets the value of a mat3 uniform variable.
     * @param location - The location of the uniform variable.
     * @param value - The array of mat3 values to set.
     */
    uniformMatrix3fv(location: string, value: Float32Array): void;
    /**
     * Sets the value of a mat4 uniform variable.
     * @param location - The location of the uniform variable.
     * @param value - The array of mat4 values to set.
     */
    uniformMatrix4fv(location: string, value: Float32Array): void;
    /**
     * ```
     * gl.getParameter(pname);
     * ```
     *
     * @param pname
     * @returns
     */
    getParameter(pname: GLenum): any;
    /**
     * ```
     * gl.drawElements(mode, count, type, offset);
     * ```
     *
     * @param mode
     * @param count
     * @param type
     * @param offset
     */
    drawElements(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr): void;
    /**
     * ```
     * gl.drawArrays(mode, first, count);
     * ```
     *
     * @param mode
     * @param first
     * @param count
     */
    drawArrays(mode: GLenum, first: GLint, count: GLsizei): void;
    /**
     * ```
     * gl.getExtension(name);
     * ```
     *
     * Results (including `null`) are memoized to avoid repeat bridge calls.
     * Call {@link clearExtensionCache} if the GL context is lost/restored
     * in place rather than recreated.
     *
     * @param name
     * @returns
     */
    getExtension(name: string): unknown;
    /**
     * Clears memoized `getExtension()` results, e.g. after an in-place
     * context restore where extensions must be re-queried.
     */
    clearExtensionCache(): void;
    /**
     * ```
     * gl.getError(type);
     * ```
     *
     * @returns
     */
    getError(): number;
    isContextLost(): boolean;
    /**
     * ```
     * gl.createVertexArray();
     * ```
     *
     * @returns
     */
    createVertexArray(): WebGLVertexArrayObject | undefined;
    /**
     * ```
     * gl.bindVertexArray(vertexArray);
     * ```
     *
     * @param vertexArray
     */
    bindVertexArray(vertexArray: WebGLVertexArrayObject | null): void;
    /**
     * ```
     * gl.getAttribLocation(program, name);
     * ```
     *
     * @param program
     * @param name
     * @returns
     */
    getAttribLocation(program: WebGLProgram, name: string): number;
    /**
     * ```
     * gl.getUniformLocation(program, name);
     * ```
     *
     * @param program
     * @param name
     * @returns
     */
    getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation | null;
    /**
     * ```
     * gl.enableVertexAttribArray(index);
     * ```
     *
     * @param index
     */
    enableVertexAttribArray(index: number): void;
    /**
     * ```
     * gl.disableVertexAttribArray(index);
     * ```
     *
     * @param index
     */
    disableVertexAttribArray(index: number): void;
    /**
     * ```
     * gl.createShader(type);
     * ```
     *
     * @param type
     * @returns
     */
    createShader(type: number): WebGLShader | null;
    /**
     * ```
     * gl.compileShader(shader);
     * ```
     *
     * @param shader
     * @returns
     */
    compileShader(shader: WebGLShader): void;
    /**
     * ```
     * gl.attachShader(program, shader);
     * ```
     *
     * @param program
     * @param shader
     */
    attachShader(program: WebGLProgram, shader: WebGLShader): void;
    /**
     * ```
     * gl.linkProgram(program);
     * ```
     *
     * @param program
     */
    linkProgram(program: WebGLProgram): void;
    /**
     * ```
     * gl.deleteProgram(shader);
     * ```
     *
     * @param shader
     */
    deleteProgram(shader: WebGLProgram): void;
    /**
     * ```
     * gl.getShaderParameter(shader, pname);
     * ```
     *
     * @param shader
     * @param pname
     */
    getShaderParameter(shader: WebGLShader, pname: GLenum): any;
    /**
     * ```
     * gl.getShaderInfoLog(shader);
     * ```
     *
     * @param shader
     */
    getShaderInfoLog(shader: WebGLShader): string | null;
    /**
     * ```
     * gl.createProgram();
     * ```
     *
     * @returns
     */
    createProgram(): WebGLProgram;
    /**
     * ```
     * gl.getProgramParameter(program, pname);
     * ```
     *
     * @param program
     * @param pname
     * @returns
     */
    getProgramParameter(program: WebGLProgram, pname: GLenum): any;
    /**
     * ```
     * gl.getProgramInfoLog(program);
     * ```
     *
     * @param program
     * @returns
     */
    getProgramInfoLog(program: WebGLProgram): string | null;
    /**
     * ```
     * gl.shaderSource(shader, source);
     * ```
     *
     * @param shader
     * @param source
     */
    shaderSource(shader: WebGLShader, source: string): void;
    /**
     * ```
     * gl.deleteShader(shader);
     * ```
     *
     * @param shader
     */
    deleteShader(shader: WebGLShader): void;
    /**
     * ```
     * gl.deleteBuffer(buffer);
     * ```
     *
     * @param buffer - The buffer to delete
     */
    deleteBuffer(buffer: WebGLBuffer): void;
    /**
     * ```
     * gl.deleteVertexArray(vertexArray);
     * ```
     *
     * @param vertexArray - The vertex array object to delete
     */
    deleteVertexArray(vertexArray: WebGLVertexArrayObject): void;
    /**
     * Check for WebGL errors and return error information
     * @param operation Description of the operation for error reporting
     * @returns Object with error information or null if no error
     */
    checkError(operation: string): {
        error: number;
        errorName: string;
        message: string;
    } | null;
    /**
     *
     * Compressed Textures support
     */
    /**
     * Ensures the WebGL extension that owns `glInternalFormat` has been queried
     * (and is therefore recognized as a valid enum by the driver) before it is
     * passed to `compressedTexImage2D`. Extensions used to be enumerated eagerly
     * in the constructor (which implicitly activated every compressed texture
     * format enum), but that enumeration is now lazy, so formats that are never
     * referenced elsewhere must be activated here or the driver will reject
     * them with `INVALID_ENUM`.
     *
     * ETC2/EAC formats are core in WebGL2 and have no extension to query, so
     * they pass through on WebGL2 contexts.
     *
     * @throws If the format's owning extension is unsupported, or the format
     * is not a recognized compressed format. Thrown in all environments
     * (including production), unlike `checkGLError()`-based handling.
     *
     * @param glInternalFormat
     */
    private ensureCompressedFormatSupported;
    uploadKTX(texture: WebGLTexture, data: CompressedData): void;
    uploadPVR(texture: WebGLTexture, data: CompressedData): void;
    uploadASTC(texture: WebGLTexture, data: CompressedData): void;
}
type IsUniformMethod<MethodName, MethodType> = MethodName extends `uniform${string}` ? MethodType extends (location: WebGLUniformLocation | null, ...args: any[]) => void ? true : false : false;
export type UniformMethodMap = {
    [Key in keyof WebGLRenderingContext as IsUniformMethod<Key, WebGLRenderingContext[Key]> extends true ? Key : never]: WebGLRenderingContext[Key] extends (location: WebGLUniformLocation | null, ...args: infer T) => void ? T : never;
};
/**
 * Compare two arrays for equality.
 *
 * @remarks
 * This function will not try to compare nested arrays or Float32Arrays and
 * instead will always return false when they are encountered.
 *
 * @param a
 * @param b
 * @returns
 */
export declare function compareArrays<T>(a: T[], b: T[]): boolean;
export {};
