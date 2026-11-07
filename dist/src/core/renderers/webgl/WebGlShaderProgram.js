import { Default } from '../../shaders/webgl/Default.js';
import { WebGlShaderNode } from './WebGlShaderNode.js';
import { createProgram, createShader, } from './internal/ShaderUtils.js';
import { CoreNode } from '../../CoreNode.js';
export class WebGlShaderProgram {
    config;
    resolvedProps;
    program;
    /**
     * Vertex Array Object
     *
     * @remarks
     * Used by WebGL2 Only
     */
    vao;
    renderer;
    glw;
    attributeLocations;
    uniformLocations;
    lifecycle;
    useSystemAlpha = false;
    useSystemDimensions = false;
    useTimeValue = false;
    isDestroyed = false;
    supportsIndexedTextures = false;
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
    lastPixelRatio = -1;
    lastResolutionW = -1;
    lastResolutionH = -1;
    lastAlpha = -1;
    lastDimensionsW = -1;
    lastDimensionsH = -1;
    lastTime = -1;
    /**
     * Last-bound shader uniform collection by identity reference.
     *
     * Uniform collections are created once, filled once, and shared by
     * reference across shader nodes with the same value key — so reference
     * equality implies value equality. Allows skipping the entire for-in
     * loop over uniform buckets when the same collection is already bound.
     */
    lastBoundUniforms = null;
    constructor(renderer, config, resolvedProps) {
        this.config = config;
        this.resolvedProps = resolvedProps;
        this.renderer = renderer;
        const glw = (this.glw = renderer.glw);
        // Check that extensions are supported
        const webGl2 = glw.isWebGl2;
        let requiredExtensions = [];
        this.supportsIndexedTextures =
            config.supportsIndexedTextures || this.supportsIndexedTextures;
        requiredExtensions =
            (webGl2 === true && config.webgl2Extensions) ||
                (webGl2 === false && config.webgl1Extensions) ||
                [];
        const glVersion = webGl2 === true ? '2.0' : '1.0';
        requiredExtensions.forEach((extensionName) => {
            if (!glw.getExtension(extensionName)) {
                throw new Error(`Shader "${this.constructor.name}" requires extension "${extensionName}" for WebGL ${glVersion} but wasn't found`);
            }
        });
        let vertexSource = config.vertex instanceof Function
            ? config.vertex(renderer, resolvedProps)
            : config.vertex;
        if (vertexSource === undefined) {
            vertexSource = Default.vertex;
        }
        const fragmentSource = config.fragment instanceof Function
            ? config.fragment(renderer, resolvedProps)
            : config.fragment;
        const vertexShader = createShader(glw, glw.VERTEX_SHADER, vertexSource);
        if (!vertexShader) {
            throw new Error('Vertex shader creation failed');
        }
        const fragmentShader = createShader(glw, glw.FRAGMENT_SHADER, fragmentSource);
        if (!fragmentShader) {
            // createShader already deleted the failed fragment shader; the
            // compiled vertex shader would otherwise leak on this path.
            glw.deleteShader(vertexShader);
            throw new Error('fragment shader creation failed');
        }
        let program;
        try {
            program = createProgram(glw, vertexShader, fragmentShader);
        }
        catch (error) {
            // createProgram deletes the program on link failure but not the
            // attached shaders — delete both so repeated restore attempts cannot
            // accumulate shader objects on low-end devices.
            glw.deleteShader(vertexShader);
            glw.deleteShader(fragmentShader);
            throw error;
        }
        // Shaders are referenced by the linked program; flag them for deletion
        // so the driver can free the source copies.
        glw.deleteShader(vertexShader);
        glw.deleteShader(fragmentShader);
        this.program = program;
        this.attributeLocations = glw.getAttributeLocations(program);
        const uniLocs = (this.uniformLocations = glw.getUniformLocations(program));
        this.useSystemAlpha = uniLocs['u_alpha'] !== undefined;
        this.useSystemDimensions = uniLocs['u_dimensions'] !== undefined;
        this.useTimeValue =
            this.glw.getUniformLocation(program, 'u_dimensions') !== null &&
                config.time !== undefined;
        this.lifecycle = {
            update: config.update,
            canBatch: config.canBatch,
        };
    }
    // Shader nodes created while the context is lost keep a stable program ref.
    static createDeferred(renderer, config, props) {
        const deferred = Object.create(WebGlShaderProgram.prototype);
        deferred.renderer = renderer;
        deferred.config = config;
        deferred.resolvedProps = props;
        deferred.glw = renderer.glw;
        deferred.program = null;
        deferred.isDestroyed = false;
        deferred.attributeLocations = [];
        deferred.uniformLocations = null;
        deferred.lifecycle = {};
        return deferred;
    }
    // Keep shader-node references stable while replacing all native GL state.
    restoreContext() {
        if (this.isDestroyed === true)
            return;
        Object.assign(this, new WebGlShaderProgram(this.renderer, this.config, this.resolvedProps));
    }
    disableAttribute(location) {
        this.glw.disableVertexAttribArray(location);
    }
    disableAttributes() {
        const glw = this.glw;
        const attribLen = this.attributeLocations.length;
        for (let i = 0; i < attribLen; i++) {
            glw.disableVertexAttribArray(i);
        }
    }
    reuseRenderOp(node, currentRenderOp) {
        if (this.lifecycle.canBatch !== undefined) {
            return this.lifecycle.canBatch(node, currentRenderOp);
        }
        if (this.useTimeValue === true) {
            if (node.time !== currentRenderOp.time) {
                return false;
            }
        }
        if (this.useSystemAlpha === true) {
            if (node.worldAlpha !== currentRenderOp.worldAlpha) {
                return false;
            }
        }
        if (this.useSystemDimensions === true) {
            if (node.w !== currentRenderOp.w || node.h !== currentRenderOp.h) {
                return false;
            }
        }
        const shader = node.props.shader;
        const opShader = currentRenderOp.shader;
        // Same shader node — same resolved props by definition.
        if (shader === opShader) {
            return true;
        }
        if (shader === null || opShader === null) {
            return false;
        }
        // Uniform collections are shared by reference across shader nodes with
        // equal value keys — reference equality implies the resolved prop values
        // match without a key-by-key compare.
        if (shader.uniforms === opShader.uniforms) {
            return true;
        }
        const shaderPropsA = shader.resolvedProps;
        const shaderPropsB = opShader.resolvedProps;
        if ((shaderPropsA === undefined && shaderPropsB !== undefined) ||
            (shaderPropsA !== undefined && shaderPropsB === undefined)) {
            return false;
        }
        if (shaderPropsA !== undefined && shaderPropsB !== undefined) {
            for (const key in shaderPropsA) {
                if (shaderPropsA[key] !== shaderPropsB[key]) {
                    return false;
                }
            }
        }
        return true;
    }
    bindRenderOp(renderOp) {
        this.bindTextures(renderOp.renderOpTextures);
        this.bindBufferCollection(renderOp.quadBufferCollection);
        const parentHasRenderTexture = renderOp.parentHasRenderTexture;
        const framebufferDimensions = renderOp.isCoreNode
            ? renderOp.parentFramebufferDimensions
            : renderOp.framebufferDimensions;
        // Skip if the parent and current operation both have render textures
        if (renderOp.rtt === true && parentHasRenderTexture === true) {
            return;
        }
        // Resolve target pixel ratio / resolution, then compare-and-set against
        // the program's shadow state to skip value-identical re-uploads.
        let pixelRatio;
        let resolutionW;
        let resolutionH;
        if (parentHasRenderTexture === true && framebufferDimensions) {
            pixelRatio = 1.0;
            resolutionW = framebufferDimensions.w;
            resolutionH = framebufferDimensions.h;
        }
        else {
            pixelRatio = renderOp.stage.pixelRatio;
            resolutionW = this.glw.canvas.width;
            resolutionH = this.glw.canvas.height;
        }
        if (pixelRatio !== this.lastPixelRatio) {
            this.glw.uniform1f('u_pixelRatio', pixelRatio);
            this.lastPixelRatio = pixelRatio;
        }
        if (resolutionW !== this.lastResolutionW ||
            resolutionH !== this.lastResolutionH) {
            this.glw.uniform2f('u_resolution', resolutionW, resolutionH);
            this.lastResolutionW = resolutionW;
            this.lastResolutionH = resolutionH;
        }
        if (this.useTimeValue === true && renderOp.time !== this.lastTime) {
            this.glw.uniform1f('u_time', renderOp.time);
            this.lastTime = renderOp.time;
        }
        if (this.useSystemAlpha === true &&
            renderOp.worldAlpha !== this.lastAlpha) {
            this.glw.uniform1f('u_alpha', renderOp.worldAlpha);
            this.lastAlpha = renderOp.worldAlpha;
        }
        if (this.useSystemDimensions === true) {
            if (renderOp.w !== this.lastDimensionsW ||
                renderOp.h !== this.lastDimensionsH) {
                this.glw.uniform2f('u_dimensions', renderOp.w, renderOp.h);
                this.lastDimensionsW = renderOp.w;
                this.lastDimensionsH = renderOp.h;
            }
        }
        const shader = renderOp.shader;
        const uniforms = shader.uniforms;
        if (shader.beforeDraw !== undefined) {
            shader.beforeDraw();
        }
        if (uniforms.hasStoredUniforms === true) {
            // Uniform collections are immutable after creation and shared by
            // reference across shader nodes with equal value keys — when the same
            // object is already bound, the GL program still holds these values.
            if (uniforms === this.lastBoundUniforms) {
                return;
            }
            this.lastBoundUniforms = uniforms;
            for (const key in uniforms.single) {
                const { method, value } = uniforms.single[key];
                this.glw[method](key, value);
            }
            for (const key in uniforms.vec2) {
                const { method, value } = uniforms.vec2[key];
                this.glw[method](key, value[0], value[1]);
            }
            for (const key in uniforms.vec3) {
                const { method, value } = uniforms.vec3[key];
                this.glw[method](key, value[0], value[1], value[2]);
            }
            for (const key in uniforms.vec4) {
                const { method, value } = uniforms.vec4[key];
                this.glw[method](key, value[0], value[1], value[2], value[3]);
            }
        }
    }
    bindBufferCollection(buffer) {
        const { glw } = this;
        const attribs = this.attributeLocations;
        const attribLen = attribs.length;
        for (let i = 0; i < attribLen; i++) {
            const attribute = buffer.getAttribute(attribs[i]);
            if (attribute === undefined) {
                continue;
            }
            const resolvedInfo = attribute.info;
            glw.enableVertexAttribArray(i);
            glw.vertexAttribPointer(attribute.buffer, i, resolvedInfo.size, resolvedInfo.type, resolvedInfo.normalized, resolvedInfo.stride, resolvedInfo.offset);
        }
    }
    bindTextures(textures) {
        const t = textures[0];
        if (t === undefined)
            return;
        this.glw.activeTexture(0);
        this.glw.bindTexture(t.ctxTexture);
    }
    attach() {
        if (this.isDestroyed === true) {
            return;
        }
        this.glw.useProgram(this.program, this.uniformLocations);
        if (this.glw.isWebGl2 === true && this.vao) {
            this.glw.bindVertexArray(this.vao);
        }
    }
    /**
     * Activate this program and bind a buffer collection without going through
     * the shader manager's detach/attach cycle. Used exclusively by the stencil
     * write pass so it does not disrupt the currently attached scene shader.
     *
     * The caller is responsible for restoring `shManager.attachedShader` to null
     * after the pass so the next real draw triggers a full re-attach.
     */
    bindForStencil(bufferCollection) {
        if (this.isDestroyed === true) {
            return;
        }
        this.glw.useProgram(this.program, this.uniformLocations);
        this.bindBufferCollection(bufferCollection);
    }
    detach() {
        this.disableAttributes();
    }
    destroy() {
        if (this.isDestroyed === true) {
            return;
        }
        const glw = this.glw;
        this.detach();
        glw.deleteProgram(this.program);
        this.program = null;
        this.uniformLocations = null;
        this.isDestroyed = true;
        this.renderer.untrackShaderProgram(this);
        const attribs = this.attributeLocations;
        const attribLen = this.attributeLocations.length;
        for (let i = 0; i < attribLen; i++) {
            this.glw.deleteBuffer(attribs[i]);
        }
    }
}
//# sourceMappingURL=WebGlShaderProgram.js.map