/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2026 Comcast Cable Communications Management, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { GlContextWrapper } from '../GlContextWrapper.js';
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
export class WebGlContextWrapper extends GlContextWrapper {
    gl;
    //#region Cached WebGL State
    activeTextureUnit = 0;
    texture2dUnits;
    texture2dParams = new WeakMap();
    scissorEnabled;
    scissorX;
    scissorY;
    scissorWidth;
    scissorHeight;
    stencilTestEnabled;
    stencilFuncMode;
    stencilFuncRef;
    stencilFuncMask;
    stencilOpFail;
    stencilOpZFail;
    stencilOpZPass;
    stencilMaskValue;
    colorMaskR;
    colorMaskG;
    colorMaskB;
    colorMaskA;
    blendEnabled;
    blendSrcRgb;
    blendDstRgb;
    blendSrcAlpha;
    blendDstAlpha;
    boundArrayBuffer;
    boundElementArrayBuffer;
    curProgram;
    curUniformLocations = {};
    /**
     * Memoized `gl.getExtension()` results (including `null` for unsupported).
     * `getExtension()` activates the extension's enums driver-side, so caching
     * the lookup avoids repeat JS->native bridge calls on every compressed
     * texture upload. Lifetime is tied to this wrapper instance, which is
     * recreated with the GL context, so no stale entries across contexts.
     */
    extCache = new Map();
    //#endregion Cached WebGL State
    //#region Canvas
    canvas;
    //#endregion Canvas
    //#region WebGL Enums
    MAX_RENDERBUFFER_SIZE;
    MAX_TEXTURE_SIZE;
    MAX_VIEWPORT_DIMS;
    MAX_VERTEX_TEXTURE_IMAGE_UNITS;
    MAX_TEXTURE_IMAGE_UNITS;
    MAX_COMBINED_TEXTURE_IMAGE_UNITS;
    MAX_VERTEX_ATTRIBS;
    MAX_VARYING_VECTORS;
    MAX_VERTEX_UNIFORM_VECTORS;
    MAX_FRAGMENT_UNIFORM_VECTORS;
    TEXTURE_MAG_FILTER;
    TEXTURE_MIN_FILTER;
    TEXTURE_WRAP_S;
    TEXTURE_WRAP_T;
    LINEAR;
    LINEAR_MIPMAP_LINEAR;
    CLAMP_TO_EDGE;
    RGB;
    RGBA;
    UNSIGNED_BYTE;
    UNPACK_PREMULTIPLY_ALPHA_WEBGL;
    UNPACK_FLIP_Y_WEBGL;
    FLOAT;
    TRIANGLES;
    UNSIGNED_SHORT;
    ONE;
    ONE_MINUS_SRC_ALPHA;
    VERTEX_SHADER;
    FRAGMENT_SHADER;
    STATIC_DRAW;
    COMPILE_STATUS;
    LINK_STATUS;
    DYNAMIC_DRAW;
    COLOR_ATTACHMENT0;
    INVALID_ENUM;
    INVALID_OPERATION;
    STENCIL_TEST;
    ALWAYS;
    EQUAL;
    KEEP;
    REPLACE;
    INCR;
    DECR;
    STENCIL_BUFFER_BIT;
    //#endregion WebGL Enums
    isWebGl2;
    constructor(gl) {
        super();
        this.gl = gl;
        this.isWebGl2 =
            typeof WebGL2RenderingContext !== 'undefined' &&
                gl instanceof WebGL2RenderingContext;
        // The following code extracts the current state of the WebGL context
        // to our local JavaScript cached version of it. This is so we can
        // avoid making WebGL calls if we don't need to.
        // We could assume that the WebGL context is in a default state, but
        // in the future we may want to support restoring a broken WebGL context
        // and this will help with that.
        this.activeTextureUnit =
            gl.getParameter(gl.ACTIVE_TEXTURE) - gl.TEXTURE0;
        const maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        // save current texture units
        this.texture2dUnits = new Array(maxTextureUnits)
            .fill(undefined)
            .map((_, i) => {
            this.activeTexture(i);
            return gl.getParameter(gl.TEXTURE_BINDING_2D);
        });
        // restore active texture unit
        this.activeTexture(this.activeTextureUnit);
        this.scissorEnabled = gl.isEnabled(gl.SCISSOR_TEST);
        const scissorBox = gl.getParameter(gl.SCISSOR_BOX);
        this.scissorX = scissorBox[0];
        this.scissorY = scissorBox[1];
        this.scissorWidth = scissorBox[2];
        this.scissorHeight = scissorBox[3];
        this.stencilTestEnabled = gl.isEnabled(gl.STENCIL_TEST);
        this.stencilFuncMode = gl.getParameter(gl.STENCIL_FUNC);
        this.stencilFuncRef = gl.getParameter(gl.STENCIL_REF);
        this.stencilFuncMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
        this.stencilOpFail = gl.getParameter(gl.STENCIL_FAIL);
        this.stencilOpZFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
        this.stencilOpZPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
        this.stencilMaskValue = gl.getParameter(gl.STENCIL_WRITEMASK);
        const colorMaskArr = gl.getParameter(gl.COLOR_WRITEMASK);
        this.colorMaskR = colorMaskArr[0];
        this.colorMaskG = colorMaskArr[1];
        this.colorMaskB = colorMaskArr[2];
        this.colorMaskA = colorMaskArr[3];
        this.blendEnabled = gl.isEnabled(gl.BLEND);
        this.blendSrcRgb = gl.getParameter(gl.BLEND_SRC_RGB);
        this.blendDstRgb = gl.getParameter(gl.BLEND_DST_RGB);
        this.blendSrcAlpha = gl.getParameter(gl.BLEND_SRC_ALPHA);
        this.blendDstAlpha = gl.getParameter(gl.BLEND_DST_ALPHA);
        this.boundArrayBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
        this.boundElementArrayBuffer = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
        this.curProgram = gl.getParameter(gl.CURRENT_PROGRAM);
        this.canvas = gl.canvas;
        // Extract GLenums
        this.MAX_RENDERBUFFER_SIZE = gl.MAX_RENDERBUFFER_SIZE;
        this.MAX_TEXTURE_SIZE = gl.MAX_TEXTURE_SIZE;
        this.MAX_VIEWPORT_DIMS = gl.MAX_VIEWPORT_DIMS;
        this.MAX_VERTEX_TEXTURE_IMAGE_UNITS = gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS;
        this.MAX_TEXTURE_IMAGE_UNITS = gl.MAX_TEXTURE_IMAGE_UNITS;
        this.MAX_COMBINED_TEXTURE_IMAGE_UNITS = gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS;
        this.MAX_VERTEX_ATTRIBS = gl.MAX_VERTEX_ATTRIBS;
        this.MAX_VARYING_VECTORS = gl.MAX_VARYING_VECTORS;
        this.MAX_VERTEX_UNIFORM_VECTORS = gl.MAX_VERTEX_UNIFORM_VECTORS;
        this.MAX_FRAGMENT_UNIFORM_VECTORS = gl.MAX_FRAGMENT_UNIFORM_VECTORS;
        this.TEXTURE_MAG_FILTER = gl.TEXTURE_MAG_FILTER;
        this.TEXTURE_MIN_FILTER = gl.TEXTURE_MIN_FILTER;
        this.TEXTURE_WRAP_S = gl.TEXTURE_WRAP_S;
        this.TEXTURE_WRAP_T = gl.TEXTURE_WRAP_T;
        this.LINEAR = gl.LINEAR;
        this.LINEAR_MIPMAP_LINEAR = gl.LINEAR_MIPMAP_LINEAR;
        this.CLAMP_TO_EDGE = gl.CLAMP_TO_EDGE;
        this.RGB = gl.RGB;
        this.RGBA = gl.RGBA;
        this.UNSIGNED_BYTE = gl.UNSIGNED_BYTE;
        this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL;
        this.UNPACK_FLIP_Y_WEBGL = gl.UNPACK_FLIP_Y_WEBGL;
        this.FLOAT = gl.FLOAT;
        this.TRIANGLES = gl.TRIANGLES;
        this.UNSIGNED_SHORT = gl.UNSIGNED_SHORT;
        this.ONE = gl.ONE;
        this.ONE_MINUS_SRC_ALPHA = gl.ONE_MINUS_SRC_ALPHA;
        this.MAX_VERTEX_TEXTURE_IMAGE_UNITS = gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS;
        this.TRIANGLES = gl.TRIANGLES;
        this.UNSIGNED_SHORT = gl.UNSIGNED_SHORT;
        this.VERTEX_SHADER = gl.VERTEX_SHADER;
        this.FRAGMENT_SHADER = gl.FRAGMENT_SHADER;
        this.STATIC_DRAW = gl.STATIC_DRAW;
        this.COMPILE_STATUS = gl.COMPILE_STATUS;
        this.LINK_STATUS = gl.LINK_STATUS;
        this.DYNAMIC_DRAW = gl.DYNAMIC_DRAW;
        this.COLOR_ATTACHMENT0 = gl.COLOR_ATTACHMENT0;
        this.INVALID_ENUM = gl.INVALID_ENUM;
        this.INVALID_OPERATION = gl.INVALID_OPERATION;
        this.STENCIL_TEST = gl.STENCIL_TEST;
        this.ALWAYS = gl.ALWAYS;
        this.EQUAL = gl.EQUAL;
        this.KEEP = gl.KEEP;
        this.REPLACE = gl.REPLACE;
        this.INCR = gl.INCR;
        this.DECR = gl.DECR;
        this.STENCIL_BUFFER_BIT = gl.STENCIL_BUFFER_BIT;
    }
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
    activeTexture(textureUnit) {
        if (this.activeTextureUnit !== textureUnit) {
            this.gl.activeTexture(textureUnit + this.gl.TEXTURE0);
            this.activeTextureUnit = textureUnit;
        }
    }
    /**
     * ```
     * gl.bindTexture(gl.TEXTURE_2D, texture);
     * ```
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     *
     * @param texture
     */
    bindTexture(texture) {
        if (this.texture2dUnits[this.activeTextureUnit] === texture) {
            return;
        }
        this.texture2dUnits[this.activeTextureUnit] = texture;
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    }
    _getActiveTexture() {
        return this.texture2dUnits[this.activeTextureUnit];
    }
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
    texParameteri(pname, param) {
        const activeTexture = this._getActiveTexture();
        if (!activeTexture) {
            throw new Error('No active texture');
        }
        let textureParams = this.texture2dParams.get(activeTexture);
        if (!textureParams) {
            textureParams = {};
            this.texture2dParams.set(activeTexture, textureParams);
        }
        if (textureParams[pname] === param) {
            return;
        }
        textureParams[pname] = param;
        this.gl.texParameteri(this.gl.TEXTURE_2D, pname, param);
    }
    texImage2D(level, internalFormat, widthOrFormat, heightOrType, borderOrSource, format, type, pixels) {
        if (format) {
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, widthOrFormat, heightOrType, borderOrSource, format, type, pixels);
        }
        else {
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, widthOrFormat, heightOrType, borderOrSource);
        }
    }
    /**
     * ```
     * gl.compressedTexImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, data);
     * ```
     *
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     */
    compressedTexImage2D(level, internalformat, width, height, border, data) {
        this.gl.compressedTexImage2D(this.gl.TEXTURE_2D, level, internalformat, width, height, border, data);
    }
    /**
     * ```
     * gl.pixelStorei(pname, param);
     * ```
     *
     * @param pname
     * @param param
     */
    pixelStorei(pname, param) {
        this.gl.pixelStorei(pname, param);
    }
    /**
     * ```
     * gl.generateMipmap(gl.TEXTURE_2D);
     * ```
     *
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.TEXTURE_2D`
     */
    generateMipmap() {
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
    /**
     * ```
     * gl.createTexture();
     * ```
     *
     * @returns
     */
    createTexture() {
        return this.gl.createTexture();
    }
    /**
     * ```
     * gl.deleteTexture(texture);
     * ```
     *
     * @param texture
     */
    deleteTexture(texture) {
        if (texture) {
            this.texture2dParams.delete(texture);
        }
        this.gl.deleteTexture(texture);
    }
    /**
     * ```
     * gl.deleteFramebuffer(framebuffer);
     *
     * @param framebuffer
     */
    deleteFramebuffer(framebuffer) {
        this.gl.deleteFramebuffer(framebuffer);
    }
    /**
     * ```
     * gl.viewport(x, y, width, height);
     * ```
     */
    viewport(x, y, width, height) {
        this.gl.viewport(x, y, width, height);
    }
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
    clearColor(red, green, blue, alpha) {
        this.gl.clearColor(red, green, blue, alpha);
    }
    /**
     * ```
     * gl["enable"|"disable"](gl.SCISSOR_TEST);
     * ```
     * @param enable
     */
    setScissorTest(enable) {
        if (enable === this.scissorEnabled) {
            return;
        }
        if (enable) {
            this.gl.enable(this.gl.SCISSOR_TEST);
        }
        else {
            this.gl.disable(this.gl.SCISSOR_TEST);
        }
        this.scissorEnabled = enable;
    }
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
    scissor(x, y, width, height) {
        if (x !== this.scissorX ||
            y !== this.scissorY ||
            width !== this.scissorWidth ||
            height !== this.scissorHeight) {
            this.gl.scissor(x, y, width, height);
            this.scissorX = x;
            this.scissorY = y;
            this.scissorWidth = width;
            this.scissorHeight = height;
        }
    }
    /**
     * ```
     * gl["enable"|"disable"](gl.BLEND);
     * ```
     *
     * @param blend
     * @returns
     */
    setBlend(blend) {
        if (blend === this.blendEnabled) {
            return;
        }
        if (blend) {
            this.gl.enable(this.gl.BLEND);
        }
        else {
            this.gl.disable(this.gl.BLEND);
        }
        this.blendEnabled = blend;
    }
    setStencilTest(enable) {
        if (enable === this.stencilTestEnabled) {
            return;
        }
        if (enable === true) {
            this.gl.enable(this.gl.STENCIL_TEST);
        }
        else {
            this.gl.disable(this.gl.STENCIL_TEST);
        }
        this.stencilTestEnabled = enable;
    }
    stencilFunc(func, ref, mask) {
        if (func !== this.stencilFuncMode ||
            ref !== this.stencilFuncRef ||
            mask !== this.stencilFuncMask) {
            this.gl.stencilFunc(func, ref, mask);
            this.stencilFuncMode = func;
            this.stencilFuncRef = ref;
            this.stencilFuncMask = mask;
        }
    }
    stencilOp(fail, zfail, zpass) {
        if (fail !== this.stencilOpFail ||
            zfail !== this.stencilOpZFail ||
            zpass !== this.stencilOpZPass) {
            this.gl.stencilOp(fail, zfail, zpass);
            this.stencilOpFail = fail;
            this.stencilOpZFail = zfail;
            this.stencilOpZPass = zpass;
        }
    }
    stencilMask(mask) {
        if (mask !== this.stencilMaskValue) {
            this.gl.stencilMask(mask);
            this.stencilMaskValue = mask;
        }
    }
    clearStencil(s) {
        this.gl.clearStencil(s);
        this.gl.clear(this.gl.STENCIL_BUFFER_BIT);
    }
    colorMask(r, g, b, a) {
        if (r !== this.colorMaskR ||
            g !== this.colorMaskG ||
            b !== this.colorMaskB ||
            a !== this.colorMaskA) {
            this.gl.colorMask(r, g, b, a);
            this.colorMaskR = r;
            this.colorMaskG = g;
            this.colorMaskB = b;
            this.colorMaskA = a;
        }
    }
    /**
     * ```
     * gl.blendFunc(src, dst);
     * ```
     *
     * @param src
     * @param dst
     */
    blendFunc(src, dst) {
        if (src !== this.blendSrcRgb ||
            dst !== this.blendDstRgb ||
            src !== this.blendSrcAlpha ||
            dst !== this.blendDstAlpha) {
            this.gl.blendFunc(src, dst);
            this.blendSrcRgb = src;
            this.blendDstRgb = dst;
            this.blendSrcAlpha = src;
            this.blendDstAlpha = dst;
        }
    }
    /**
     * ```
     * gl.createBuffer();
     * ```
     *
     * @returns
     */
    createBuffer() {
        return this.gl.createBuffer();
    }
    /**
     * ```
     * gl.createFramebuffer();
     * ```
     * @returns
     */
    createFramebuffer() {
        return this.gl.createFramebuffer();
    }
    /**
     * ```
     * gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
     * ```
     *
     * @param framebuffer
     */
    bindFramebuffer(framebuffer) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    }
    /**
     * ```
     * gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
     * ```
     * @remarks
     * **WebGL Difference**: Bind target is always `gl.FRAMEBUFFER` and textarget is always `gl.TEXTURE_2D`
     */
    framebufferTexture2D(attachment, texture, level) {
        const gl = this.gl;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture, level);
    }
    /**
     * ```
     * gl.clear(gl.COLOR_BUFFER_BIT);
     * ```
     *
     * @remarks
     * **WebGL Difference**: Clear mask is always `gl.COLOR_BUFFER_BIT`
     */
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
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
    arrayBufferData(buffer, data, usage) {
        if (this.boundArrayBuffer !== buffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.boundArrayBuffer = buffer;
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
    }
    // bindBuffer (if needed) then bufferSubData. Surgically updates a subset of
    // the GPU buffer without reallocating it.
    arrayBufferSubData(buffer, dstByteOffset, data) {
        if (this.boundArrayBuffer !== buffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.boundArrayBuffer = buffer;
        }
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, dstByteOffset, data);
    }
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
    elementArrayBufferData(buffer, data, usage) {
        if (this.boundElementArrayBuffer !== buffer) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
            this.boundElementArrayBuffer = buffer;
        }
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, usage);
    }
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
    vertexAttribPointer(buffer, index, size, type, normalized, stride, offset) {
        if (this.boundArrayBuffer !== buffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.boundArrayBuffer = buffer;
        }
        this.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    }
    /**
     * Returns object with Attribute names as key and numbers as location values
     *
     * @param program
     * @returns object with numbers
     */
    getUniformLocations(program) {
        const gl = this.gl;
        const length = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        const result = {};
        for (let i = 0; i < length; i++) {
            const info = gl.getActiveUniform(program, i);
            //remove bracket + value from uniform name;
            let name = info.name.replace(/\[.*?\]/g, '');
            result[name] = gl.getUniformLocation(program, name);
        }
        return result;
    }
    /**
     * Returns object with Attribute names as key and numbers as location values
     * @param program
     * @returns object with numbers
     */
    getAttributeLocations(program) {
        const gl = this.gl;
        const length = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        const result = [];
        for (let i = 0; i < length; i++) {
            const { name } = gl.getActiveAttrib(program, i);
            result[gl.getAttribLocation(program, name)] = name;
        }
        return result;
    }
    /**
     * ```
     * gl.useProgram(program);
     * ```
     *
     * @param program
     * @returns
     */
    useProgram(program, uniformLocations) {
        if (this.curProgram === program) {
            return;
        }
        this.gl.useProgram(program);
        this.curProgram = program;
        this.curUniformLocations = uniformLocations;
    }
    /**
     * Sets the value of a single float uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The value to set.
     */
    uniform1f(location, v0) {
        this.gl.uniform1f(this.curUniformLocations[location] || null, v0);
    }
    /**
     * Sets the value of a float array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of values to set.
     */
    uniform1fv(location, value) {
        this.gl.uniform1fv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a single integer uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The value to set.
     */
    uniform1i(location, v0) {
        this.gl.uniform1i(this.curUniformLocations[location] || null, v0);
    }
    /**
     * Sets the value of an integer array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of values to set.
     */
    uniform1iv(location, value) {
        this.gl.uniform1iv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a vec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     */
    uniform2f(location, v0, v1) {
        this.gl.uniform2f(this.curUniformLocations[location] || null, v0, v1);
    }
    /**
     * Sets the value of a vec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v - array of 2 numbers.
     */
    uniform2fa(location, value) {
        this.gl.uniform2f(this.curUniformLocations[location] || null, value[0], value[1]);
    }
    /**
     * Sets the value of a vec2 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec2 values to set.
     */
    uniform2fv(location, value) {
        this.gl.uniform2fv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a ivec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     */
    uniform2i(location, v0, v1) {
        this.gl.uniform2i(this.curUniformLocations[location] || null, v0, v1);
    }
    /**
     * Sets the value of an ivec2 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec2 values to set.
     */
    uniform2iv(location, value) {
        this.gl.uniform2iv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a vec3 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     */
    uniform3f(location, v0, v1, v2) {
        this.gl.uniform3f(this.curUniformLocations[location] || null, v0, v1, v2);
    }
    /**
     * Sets the value of a vec3 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v - array of 3 numbers.
     */
    uniform3fa(location, value) {
        this.gl.uniform3f(this.curUniformLocations[location] || null, value[0], value[1], value[2]);
    }
    /**
     * Sets the value of a vec3 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec3 values to set.
     */
    uniform3fv(location, value) {
        this.gl.uniform3fv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a ivec3 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     */
    uniform3i(location, v0, v1, v2) {
        this.gl.uniform3i(this.curUniformLocations[location] || null, v0, v1, v2);
    }
    /**
     * Sets the value of an ivec3 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec3 values to set.
     */
    uniform3iv(location, value) {
        this.gl.uniform3iv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a vec4 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     * @param v3 - The fourth component of the vector.
     */
    uniform4f(location, v0, v1, v2, v3) {
        this.gl.uniform4f(this.curUniformLocations[location] || null, v0, v1, v2, v3);
    }
    /**
     * Sets the value of a vec4 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v - array of 4 numbers.
     */
    uniform4fa(location, value) {
        this.gl.uniform4f(this.curUniformLocations[location] || null, value[0], value[1], value[2], value[3]);
    }
    /**
     * Sets the value of a vec4 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec4 values to set.
     */
    uniform4fv(location, value) {
        this.gl.uniform4fv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a ivec4 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     * @param v2 - The third component of the vector.
     * @param v3 - The fourth component of the vector.
     */
    uniform4i(location, v0, v1, v2, v3) {
        this.gl.uniform4i(this.curUniformLocations[location] || null, v0, v1, v2, v3);
    }
    /**
     * Sets the value of an ivec4 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec4 values to set.
     */
    uniform4iv(location, value) {
        this.gl.uniform4iv(this.curUniformLocations[location] || null, value);
    }
    /**
     * Sets the value of a mat2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param transpose - Whether to transpose the matrix.
     * @param value - The array of mat2 values to set.
     */
    uniformMatrix2fv(location, value) {
        this.gl.uniformMatrix2fv(this.curUniformLocations[location] || null, false, value);
    }
    /**
     * Sets the value of a mat3 uniform variable.
     * @param location - The location of the uniform variable.
     * @param value - The array of mat3 values to set.
     */
    uniformMatrix3fv(location, value) {
        this.gl.uniformMatrix3fv(this.curUniformLocations[location] || null, false, value);
    }
    /**
     * Sets the value of a mat4 uniform variable.
     * @param location - The location of the uniform variable.
     * @param value - The array of mat4 values to set.
     */
    uniformMatrix4fv(location, value) {
        this.gl.uniformMatrix4fv(this.curUniformLocations[location] || null, false, value);
    }
    /**
     * ```
     * gl.getParameter(pname);
     * ```
     *
     * @param pname
     * @returns
     */
    getParameter(pname) {
        return this.gl.getParameter(pname);
    }
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
    drawElements(mode, count, type, offset) {
        this.gl.drawElements(mode, count, type, offset);
    }
    /**
     * ```
     * gl.drawArrays(mode, first, count);
     * ```
     *
     * @param mode
     * @param first
     * @param count
     */
    drawArrays(mode, first, count) {
        this.gl.drawArrays(mode, first, count);
    }
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
    getExtension(name) {
        if (this.extCache.has(name) === false) {
            this.extCache.set(name, this.gl.getExtension(name));
        }
        return this.extCache.get(name);
    }
    /**
     * Clears memoized `getExtension()` results, e.g. after an in-place
     * context restore where extensions must be re-queried.
     */
    clearExtensionCache() {
        this.extCache.clear();
    }
    /**
     * ```
     * gl.getError(type);
     * ```
     *
     * @returns
     */
    getError() {
        return this.gl.getError();
    }
    isContextLost() {
        return this.gl.isContextLost();
    }
    /**
     * ```
     * gl.createVertexArray();
     * ```
     *
     * @returns
     */
    createVertexArray() {
        if (this.isWebGl2 === true) {
            return this.gl.createVertexArray();
        }
        return undefined;
    }
    /**
     * ```
     * gl.bindVertexArray(vertexArray);
     * ```
     *
     * @param vertexArray
     */
    bindVertexArray(vertexArray) {
        if (this.isWebGl2 === true) {
            this.gl.bindVertexArray(vertexArray);
        }
    }
    /**
     * ```
     * gl.getAttribLocation(program, name);
     * ```
     *
     * @param program
     * @param name
     * @returns
     */
    getAttribLocation(program, name) {
        return this.gl.getAttribLocation(program, name);
    }
    /**
     * ```
     * gl.getUniformLocation(program, name);
     * ```
     *
     * @param program
     * @param name
     * @returns
     */
    getUniformLocation(program, name) {
        return this.gl.getUniformLocation(program, name);
    }
    /**
     * ```
     * gl.enableVertexAttribArray(index);
     * ```
     *
     * @param index
     */
    enableVertexAttribArray(index) {
        this.gl.enableVertexAttribArray(index);
    }
    /**
     * ```
     * gl.disableVertexAttribArray(index);
     * ```
     *
     * @param index
     */
    disableVertexAttribArray(index) {
        this.gl.disableVertexAttribArray(index);
    }
    /**
     * ```
     * gl.createShader(type);
     * ```
     *
     * @param type
     * @returns
     */
    createShader(type) {
        return this.gl.createShader(type);
    }
    /**
     * ```
     * gl.compileShader(shader);
     * ```
     *
     * @param shader
     * @returns
     */
    compileShader(shader) {
        this.gl.compileShader(shader);
    }
    /**
     * ```
     * gl.attachShader(program, shader);
     * ```
     *
     * @param program
     * @param shader
     */
    attachShader(program, shader) {
        this.gl.attachShader(program, shader);
    }
    /**
     * ```
     * gl.linkProgram(program);
     * ```
     *
     * @param program
     */
    linkProgram(program) {
        this.gl.linkProgram(program);
    }
    /**
     * ```
     * gl.deleteProgram(shader);
     * ```
     *
     * @param shader
     */
    deleteProgram(shader) {
        this.gl.deleteProgram(shader);
    }
    /**
     * ```
     * gl.getShaderParameter(shader, pname);
     * ```
     *
     * @param shader
     * @param pname
     */
    getShaderParameter(shader, pname) {
        return this.gl.getShaderParameter(shader, pname);
    }
    /**
     * ```
     * gl.getShaderInfoLog(shader);
     * ```
     *
     * @param shader
     */
    getShaderInfoLog(shader) {
        return this.gl.getShaderInfoLog(shader);
    }
    /**
     * ```
     * gl.createProgram();
     * ```
     *
     * @returns
     */
    createProgram() {
        return this.gl.createProgram();
    }
    /**
     * ```
     * gl.getProgramParameter(program, pname);
     * ```
     *
     * @param program
     * @param pname
     * @returns
     */
    getProgramParameter(program, pname) {
        return this.gl.getProgramParameter(program, pname);
    }
    /**
     * ```
     * gl.getProgramInfoLog(program);
     * ```
     *
     * @param program
     * @returns
     */
    getProgramInfoLog(program) {
        return this.gl.getProgramInfoLog(program);
    }
    /**
     * ```
     * gl.shaderSource(shader, source);
     * ```
     *
     * @param shader
     * @param source
     */
    shaderSource(shader, source) {
        this.gl.shaderSource(shader, source);
    }
    /**
     * ```
     * gl.deleteShader(shader);
     * ```
     *
     * @param shader
     */
    deleteShader(shader) {
        this.gl.deleteShader(shader);
    }
    /**
     * ```
     * gl.deleteBuffer(buffer);
     * ```
     *
     * @param buffer - The buffer to delete
     */
    deleteBuffer(buffer) {
        const { gl } = this;
        gl.deleteBuffer(buffer);
        // Reset bound buffers if they match the deleted buffer
        if (this.boundArrayBuffer === buffer) {
            this.boundArrayBuffer = null;
        }
    }
    /**
     * ```
     * gl.deleteVertexArray(vertexArray);
     * ```
     *
     * @param vertexArray - The vertex array object to delete
     */
    deleteVertexArray(vertexArray) {
        if (this.isWebGl2 === true) {
            this.gl.deleteVertexArray(vertexArray);
        }
    }
    /**
     * Check for WebGL errors and return error information
     * @param operation Description of the operation for error reporting
     * @returns Object with error information or null if no error
     */
    checkError(operation) {
        const error = this.getError();
        if (error !== 0) {
            // 0 is GL_NO_ERROR
            let errorName = 'UNKNOWN_ERROR';
            switch (error) {
                case this.INVALID_ENUM:
                    errorName = 'INVALID_ENUM';
                    break;
                case 0x0501: // GL_INVALID_VALUE
                    errorName = 'INVALID_VALUE';
                    break;
                case this.INVALID_OPERATION:
                    errorName = 'INVALID_OPERATION';
                    break;
                case 0x0505: // GL_OUT_OF_MEMORY
                    errorName = 'OUT_OF_MEMORY';
                    break;
                case 0x9242: // GL_CONTEXT_LOST_WEBGL
                    errorName = 'CONTEXT_LOST_WEBGL';
                    break;
            }
            const message = `WebGL ${errorName} (0x${error.toString(16)}) during ${operation}`;
            return { error, errorName, message };
        }
        return null;
    }
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
    ensureCompressedFormatSupported(glInternalFormat) {
        // PVRTC ships under two possible extension names. Probe each once and
        // return on the first hit so the supported path costs a single
        // (memoized) `getExtension()` call.
        if (glInternalFormat >= 0x8c00 && glInternalFormat <= 0x8c03) {
            if (this.getExtension('WEBGL_compressed_texture_pvrtc') !== null) {
                return;
            }
            if (this.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc') !== null) {
                return;
            }
            throw new Error(`Compressed texture format 0x${glInternalFormat.toString(16)} requires extension "WEBGL_compressed_texture_pvrtc" or "WEBKIT_WEBGL_compressed_texture_pvrtc" which is not supported by this device`);
        }
        let extensionName = null;
        if (glInternalFormat >= 0x83f0 && glInternalFormat <= 0x83f3) {
            extensionName = 'WEBGL_compressed_texture_s3tc';
        }
        else if (glInternalFormat === 0x8d64) {
            extensionName = 'WEBGL_compressed_texture_etc1';
        }
        else if (glInternalFormat >= 0x9270 && glInternalFormat <= 0x9279) {
            // ETC2/EAC is core in WebGL2: no extension exists to query and
            // `getExtension()` would return null, so skip the check entirely.
            if (this.isWebGl2 === true) {
                return;
            }
            extensionName = 'WEBGL_compressed_texture_etc';
        }
        else if (glInternalFormat >= 0x93b0 && glInternalFormat <= 0x93d5) {
            extensionName = 'WEBGL_compressed_texture_astc';
        }
        if (extensionName === null) {
            throw new Error(`Compressed texture format 0x${glInternalFormat.toString(16)} is not a recognized compressed texture format`);
        }
        if (this.getExtension(extensionName) === null) {
            throw new Error(`Compressed texture format 0x${glInternalFormat.toString(16)} requires extension "${extensionName}" which is not supported by this device`);
        }
    }
    uploadKTX(texture, data) {
        const { glInternalFormat, mipmaps, w: width, h: height, blockInfo } = data;
        if (mipmaps === undefined) {
            return;
        }
        this.ensureCompressedFormatSupported(glInternalFormat);
        this.bindTexture(texture);
        const blockWidth = blockInfo.width;
        const blockHeight = blockInfo.height;
        let w = width;
        let h = height;
        for (let i = 0; i < mipmaps.length; i++) {
            let view = new Uint8Array(mipmaps[i]);
            const uploadW = Math.ceil(w / blockWidth) * blockWidth;
            const uploadH = Math.ceil(h / blockHeight) * blockHeight;
            const expectedBytes = Math.ceil(w / blockWidth) *
                Math.ceil(h / blockHeight) *
                blockInfo.bytes;
            if (view.byteLength < expectedBytes) {
                const padded = new Uint8Array(expectedBytes);
                padded.set(view);
                view = padded;
            }
            this.compressedTexImage2D(i, glInternalFormat, uploadW, uploadH, 0, view);
            w = Math.max(1, w >> 1);
            h = Math.max(1, h >> 1);
        }
        this.texParameteri(this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_MAG_FILTER, this.LINEAR);
        this.texParameteri(this.TEXTURE_MIN_FILTER, mipmaps.length > 1 ? this.LINEAR_MIPMAP_LINEAR : this.LINEAR);
    }
    uploadPVR(texture, data) {
        const { glInternalFormat, mipmaps, w: width, h: height } = data;
        if (mipmaps === undefined) {
            return;
        }
        this.ensureCompressedFormatSupported(glInternalFormat);
        this.bindTexture(texture);
        let w = width;
        let h = height;
        for (let i = 0; i < mipmaps.length; i++) {
            this.compressedTexImage2D(i, glInternalFormat, w, h, 0, new Uint8Array(mipmaps[i]));
            w = Math.max(1, w >> 1);
            h = Math.max(1, h >> 1);
        }
        this.texParameteri(this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_MAG_FILTER, this.LINEAR);
        this.texParameteri(this.TEXTURE_MIN_FILTER, mipmaps.length > 1 ? this.LINEAR_MIPMAP_LINEAR : this.LINEAR);
    }
    uploadASTC(texture, data) {
        const { glInternalFormat, mipmaps, w, h } = data;
        this.ensureCompressedFormatSupported(glInternalFormat);
        this.bindTexture(texture);
        if (mipmaps === undefined) {
            return;
        }
        const view = new Uint8Array(mipmaps[0]);
        this.compressedTexImage2D(0, glInternalFormat, w, h, 0, view);
        // ASTC textures MUST use no mipmaps unless stored
        this.texParameteri(this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_MAG_FILTER, this.LINEAR);
        this.texParameteri(this.TEXTURE_MIN_FILTER, this.LINEAR);
    }
}
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
export function compareArrays(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let result = false;
    for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i]) || a[i] instanceof Float32Array) {
            result = false;
            break;
        }
        if (a[i] !== b[i]) {
            result = false;
            break;
        }
        result = true;
    }
    return result;
}
//# sourceMappingURL=WebGlContextWrapper.js.map