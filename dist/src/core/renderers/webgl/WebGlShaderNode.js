import { getNormalizedRgbaComponents } from '../../lib/utils.js';
import { CoreShaderNode } from '../CoreShaderNode.js';
export class WebGlShaderNode extends CoreShaderNode {
    program;
    updater = undefined;
    beforeDrawFn = undefined;
    valueKey = '';
    additionalTextureCount = 0;
    uniforms = {
        hasStoredUniforms: false,
        single: {},
        vec2: {},
        vec3: {},
        vec4: {},
    };
    constructor(shaderKey, config, program, stage, props) {
        super(shaderKey, config, stage, props);
        this.program = program;
        if (config.update !== undefined) {
            this.updater = config.update;
            this.update = () => {
                if (this.props === undefined) {
                    this.updater(this.node, this.props);
                    this.updateUniformUsage();
                    return;
                }
                const prevKey = this.valueKey;
                this.valueKey = this.createValueKey();
                if (prevKey === this.valueKey) {
                    return;
                }
                if (prevKey.length > 0) {
                    stage.shManager.mutateShaderValueUsage(prevKey, -1);
                }
                const values = stage.shManager.getShaderValues(this.valueKey);
                if (values !== undefined) {
                    this.uniforms = values;
                    return;
                }
                //create empty uniform collection when calculating new values
                this.uniforms = {
                    hasStoredUniforms: false,
                    single: {},
                    vec2: {},
                    vec3: {},
                    vec4: {},
                };
                this.updater(this.node);
                this.updateUniformUsage();
                stage.shManager.setShaderValues(this.valueKey, this.uniforms);
            };
        }
        if (config.beforeDraw !== undefined) {
            this.beforeDrawFn = config.beforeDraw;
            this.beforeDraw = () => {
                this.additionalTextureCount = 0;
                this.beforeDrawFn(this.node, this.props);
            };
        }
    }
    // beforeDraw() {
    //   if (this.beforeDrawFn !== undefined) {
    //     // reset additional texture count before each draw call, so that the shader node can bind additional textures if needed
    //     this.additionalTextureCount = 0;
    //     this.beforeDrawFn(this.node as CoreNode, this.props as Props);
    //   }
    // }
    bindTexture(location, texture) {
        const glw = this.program.glw;
        const targetId = this.additionalTextureCount +
            this.node.renderOpTextures.length;
        this.uniform1i(location, targetId);
        this.additionalTextureCount++;
        if (texture.state === 'loaded') {
            glw.activeTexture(targetId);
            const nativeTexture = texture.ctxTexture.ctxTexture;
            glw.bindTexture(nativeTexture);
        }
    }
    updateUniformUsage() {
        for (const _ in this.uniforms.single) {
            this.uniforms.hasStoredUniforms = true;
            return;
        }
        for (const _ in this.uniforms.vec2) {
            this.uniforms.hasStoredUniforms = true;
            return;
        }
        for (const _ in this.uniforms.vec3) {
            this.uniforms.hasStoredUniforms = true;
            return;
        }
        for (const _ in this.uniforms.vec4) {
            this.uniforms.hasStoredUniforms = true;
            return;
        }
        this.uniforms.hasStoredUniforms = false;
    }
    /**
     * Sets the value of a RGBA variable
     * @param location
     * @param value
     * @param premultiplyAlpha
     */
    uniformRGBA(location, value, premultiplyAlpha = false) {
        const rgba = getNormalizedRgbaComponents(value);
        if (premultiplyAlpha === false || rgba[3] === 1) {
            this.uniform4fa(location, rgba);
            return;
        }
        const a = rgba[3];
        rgba[0] *= a;
        rgba[1] *= a;
        rgba[2] *= a;
        this.uniform4fa(location, rgba);
    }
    /**
     * Sets the value of a single float uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The value to set.
     */
    uniform1f(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform1f',
            value,
        };
    }
    /**
     * Sets the value of a float array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of values to set.
     */
    uniform1fv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform1fv',
            value,
        };
    }
    /**
     * Sets the value of a single integer uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The value to set.
     */
    uniform1i(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform1i',
            value,
        };
    }
    /**
     * Sets the value of an integer array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of values to set.
     */
    uniform1iv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform1iv',
            value,
        };
    }
    /**
     * Sets the value of a vec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     */
    uniform2f(location, v0, v1) {
        this.uniforms.vec2[location] = {
            method: 'uniform2f',
            value: [v0, v1],
        };
    }
    /**
     * Sets the value of a vec2 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec2 values to set as FloatArray.
     */
    uniform2fv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform2fv',
            value,
        };
    }
    /**
     * Sets the value of a vec2 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec2 values to set.
     */
    uniform2fa(location, value) {
        this.uniforms.vec2[location] = {
            method: 'uniform2f',
            value,
        };
    }
    /**
     * Sets the value of a ivec2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param v0 - The first component of the vector.
     * @param v1 - The second component of the vector.
     */
    uniform2i(location, v0, v1) {
        this.uniforms.vec2[location] = {
            method: 'uniform2i',
            value: [v0, v1],
        };
    }
    /**
     * Sets the value of an ivec2 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec2 values to set.
     */
    uniform2iv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform2iv',
            value,
        };
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
        this.uniforms.vec3[location] = {
            method: 'uniform3f',
            value: [v0, v1, v2],
        };
    }
    /**
     * Sets the value of a vec3 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param
     */
    uniform3fa(location, value) {
        this.uniforms.vec3[location] = {
            method: 'uniform3f',
            value,
        };
    }
    /**
     * Sets the value of a vec3 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec3 values to set.
     */
    uniform3fv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform3fv',
            value,
        };
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
        this.uniforms.vec3[location] = {
            method: 'uniform3i',
            value: [v0, v1, v2],
        };
    }
    /**
     * Sets the value of an ivec3 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec3 values to set.
     */
    uniform3iv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform3iv',
            value,
        };
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
        this.uniforms.vec4[location] = {
            method: 'uniform4f',
            value: [v0, v1, v2, v3],
        };
    }
    /**
     * Sets an array of numbers
     * @param location The location of the uniform variable.
     * @param value
     */
    uniform4fa(location, value) {
        this.uniforms.vec4[location] = {
            method: 'uniform4f',
            value,
        };
    }
    /**
     * Sets the value of a vec4 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of vec4 values to set.
     */
    uniform4fv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform4fv',
            value,
        };
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
        this.uniforms.vec4[location] = {
            method: 'uniform4i',
            value: [v0, v1, v2, v3],
        };
    }
    /**
     * Sets the value of an ivec4 array uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param value - The array of ivec4 values to set.
     */
    uniform4iv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniform4iv',
            value,
        };
    }
    /**
     * Sets the value of a mat2 uniform variable.
     *
     * @param location - The location of the uniform variable.
     * @param transpose - Whether to transpose the matrix.
     * @param value - The array of mat2 values to set.
     */
    uniformMatrix2fv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniformMatrix2fv',
            value,
        };
    }
    /**
     * Sets the value of a mat2 uniform variable.
     * @param location - The location of the uniform variable.
     * @param value - The array of mat2 values to set.
     */
    uniformMatrix3fv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniformMatrix3fv',
            value,
        };
    }
    /**
     * Sets the value of a mat4 uniform variable.
     * @param location - The location of the uniform variable.
     * @param value - The array of mat4 values to set.
     */
    uniformMatrix4fv(location, value) {
        this.uniforms.single[location] = {
            method: 'uniformMatrix4fv',
            value,
        };
    }
}
//# sourceMappingURL=WebGlShaderNode.js.map