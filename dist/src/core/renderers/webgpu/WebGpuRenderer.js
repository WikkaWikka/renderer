/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2026 Comcast Cable Communications Management, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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
import { SubTexture } from '../../textures/SubTexture.js';
import { TextureType, } from '../../textures/Texture.js';
import { CoreContextTexture } from '../CoreContextTexture.js';
import { CoreRenderer } from '../CoreRenderer.js';
import { CoreShaderNode } from '../CoreShaderNode.js';
import { WebGpuCtxSubTexture } from './WebGpuCtxSubTexture.js';
import { WebGpuCtxTexture } from './WebGpuCtxTexture.js';
import { rgbaToGpuColor, toWebGpuScissorRect, WEBGPU_FLOATS_PER_QUAD, WEBGPU_FLOATS_PER_VERTEX, WEBGPU_VERTICES_PER_QUAD, writeWebGpuQuad, } from './internal/RendererUtils.js';
const DEFAULT_TEXTURE_COORDS = {
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 1,
};
const GPU_BUFFER_USAGE = {
    COPY_DST: 0x08,
    VERTEX: 0x20,
};
const GPU_TEXTURE_USAGE = {
    COPY_SRC: 0x01,
    RENDER_ATTACHMENT: 0x10,
};
const DEFAULT_SHADER = `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec4f,
};

@vertex
fn vertexMain(
  @location(0) position: vec2f,
  @location(1) uv: vec2f,
  @location(2) color: vec4f,
) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4f(position, 0.0, 1.0);
  output.uv = uv;
  output.color = color;
  return output;
}

@group(0) @binding(0) var colorSampler: sampler;
@group(0) @binding(1) var colorTexture: texture_2d<f32>;

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return textureSample(colorTexture, colorSampler, input.uv) * input.color;
}
`;
export class WebGpuRenderer extends CoreRenderer {
    mode = 'webgpu';
    defaultTextureCoords = DEFAULT_TEXTURE_COORDS;
    renderToTextureActive = false;
    activeRttNode = null;
    device;
    context;
    format;
    canvas;
    pipeline;
    sampler;
    quads = [];
    bindGroups = new WeakMap();
    vertexBuffer = null;
    vertexBufferSize = 0;
    clearColor;
    numQuadsRendered = 0;
    constructor(stage) {
        super(stage);
        const device = stage.options.webGpuDevice;
        if (device === null) {
            throw new Error('WebGpuRenderer requires settings.webGpuDevice. Await requestWebGpuDevice() before constructing RendererMain.');
        }
        this.device = device;
        const canvas = stage.platform.canvas;
        if (canvas === null) {
            throw new Error('WebGpuRenderer requires a canvas');
        }
        this.canvas = canvas;
        const context = canvas.getContext('webgpu');
        if (context === null) {
            throw new Error('Canvas did not provide a WebGPU context');
        }
        this.context = context;
        this.format =
            stage.options.webGpuFormat ?? navigator.gpu.getPreferredCanvasFormat();
        this.clearColor = rgbaToGpuColor(stage.clearColor);
        this.sampler = device.createSampler({
            label: 'Lightning WebGPU linear sampler',
            magFilter: 'linear',
            minFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
        });
        const shader = device.createShaderModule({
            label: 'Lightning WebGPU default quad shader',
            code: DEFAULT_SHADER,
        });
        this.pipeline = device.createRenderPipeline({
            label: 'Lightning WebGPU default quad pipeline',
            layout: 'auto',
            vertex: {
                module: shader,
                entryPoint: 'vertexMain',
                buffers: [
                    {
                        arrayStride: WEBGPU_FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: 'float32x2' },
                            {
                                shaderLocation: 1,
                                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                                format: 'float32x2',
                            },
                            {
                                shaderLocation: 2,
                                offset: 4 * Float32Array.BYTES_PER_ELEMENT,
                                format: 'float32x4',
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: shader,
                entryPoint: 'fragmentMain',
                targets: [
                    {
                        format: this.format,
                        blend: {
                            color: {
                                srcFactor: 'one',
                                dstFactor: 'one-minus-src-alpha',
                                operation: 'add',
                            },
                            alpha: {
                                srcFactor: 'one',
                                dstFactor: 'one-minus-src-alpha',
                                operation: 'add',
                            },
                        },
                    },
                ],
            },
            primitive: { topology: 'triangle-list' },
        });
        this.configureContext();
    }
    configureContext() {
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'premultiplied',
            usage: GPU_TEXTURE_USAGE.RENDER_ATTACHMENT | GPU_TEXTURE_USAGE.COPY_SRC,
        });
    }
    reset() {
        this.quads.length = 0;
        this.numQuadsRendered = 0;
    }
    addQuad(node) {
        const source = (node.props.texture || this.stage.defaultTexture);
        const contextTexture = source.loadCtxTexture();
        contextTexture.load();
        if (contextTexture.view === null)
            return;
        this.quads.push({
            node,
            texture: contextTexture,
            textureCoords: this.resolveTextureCoords(source),
        });
    }
    resolveTextureCoords(texture) {
        if (texture.type !== TextureType.subTexture) {
            return DEFAULT_TEXTURE_COORDS;
        }
        const subTexture = texture;
        const parentDimensions = subTexture.parentTexture.dimensions;
        if (parentDimensions === null ||
            parentDimensions.w === 0 ||
            parentDimensions.h === 0) {
            return DEFAULT_TEXTURE_COORDS;
        }
        const { x, y, w, h } = subTexture.props;
        return {
            x1: x / parentDimensions.w,
            y1: y / parentDimensions.h,
            x2: (x + w) / parentDimensions.w,
            y2: (y + h) / parentDimensions.h,
        };
    }
    render() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const vertexData = new Float32Array(this.quads.length * WEBGPU_FLOATS_PER_QUAD);
        for (let index = 0; index < this.quads.length; index++) {
            writeWebGpuQuad(vertexData, index * WEBGPU_FLOATS_PER_QUAD, this.quads[index].node, this.quads[index].textureCoords, canvasWidth, canvasHeight, this.stage.pixelRatio);
        }
        if (vertexData.byteLength > 0) {
            this.ensureVertexBuffer(vertexData.byteLength);
            this.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData);
        }
        const encoder = this.device.createCommandEncoder({
            label: 'Lightning WebGPU frame encoder',
        });
        const pass = encoder.beginRenderPass({
            label: 'Lightning WebGPU screen pass',
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: this.clearColor,
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        });
        pass.setPipeline(this.pipeline);
        if (this.vertexBuffer !== null)
            pass.setVertexBuffer(0, this.vertexBuffer);
        for (let index = 0; index < this.quads.length; index++) {
            const quad = this.quads[index];
            const scissor = toWebGpuScissorRect(quad.node.clippingRect, canvasWidth, canvasHeight, this.stage.pixelRatio);
            if (scissor.w === 0 || scissor.h === 0)
                continue;
            pass.setScissorRect(scissor.x, scissor.y, scissor.w, scissor.h);
            pass.setBindGroup(0, this.getBindGroup(quad.texture));
            pass.draw(WEBGPU_VERTICES_PER_QUAD, 1, index * WEBGPU_VERTICES_PER_QUAD);
            this.numQuadsRendered++;
        }
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }
    ensureVertexBuffer(byteLength) {
        if (this.vertexBuffer !== null && this.vertexBufferSize >= byteLength) {
            return;
        }
        this.vertexBuffer?.destroy();
        this.vertexBufferSize = Math.max(256, 2 ** Math.ceil(Math.log2(byteLength)));
        this.vertexBuffer = this.device.createBuffer({
            label: 'Lightning WebGPU quad vertex buffer',
            size: this.vertexBufferSize,
            usage: GPU_BUFFER_USAGE.VERTEX | GPU_BUFFER_USAGE.COPY_DST,
        });
    }
    getBindGroup(contextTexture) {
        const cached = this.bindGroups.get(contextTexture);
        if (cached !== undefined && cached.version === contextTexture.version) {
            return cached.bindGroup;
        }
        const view = contextTexture.view;
        if (view === null) {
            throw new Error('WebGPU texture is not loaded');
        }
        const bindGroup = this.device.createBindGroup({
            label: 'Lightning WebGPU texture bind group',
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: this.sampler },
                { binding: 1, resource: view },
            ],
        });
        this.bindGroups.set(contextTexture, {
            version: contextTexture.version,
            bindGroup,
        });
        return bindGroup;
    }
    createCtxTexture(textureSource) {
        if (textureSource instanceof SubTexture) {
            return new WebGpuCtxSubTexture(this.stage.txMemManager, textureSource);
        }
        return new WebGpuCtxTexture(this.device, this.stage.txMemManager, textureSource);
    }
    createShaderProgram() {
        return null;
    }
    createShaderNode(shaderKey, shaderType, props) {
        return new CoreShaderNode(shaderKey, shaderType, this.stage, props);
    }
    supportsShaderType() {
        return false;
    }
    getDefaultShaderNode() {
        return null;
    }
    renderRTTNodes() {
        // Render-to-texture is outside the initial WebGPU spike.
    }
    removeRTTNode(node) {
        const index = this.rttNodes.indexOf(node);
        if (index >= 0)
            this.rttNodes.splice(index, 1);
    }
    renderToTexture() {
        // Render-to-texture is outside the initial WebGPU spike.
    }
    getBufferInfo() {
        return {
            totalUsed: this.quads.length * WEBGPU_FLOATS_PER_QUAD * 4,
            totalAvailable: this.vertexBufferSize,
        };
    }
    getQuadCount() {
        return this.numQuadsRendered;
    }
    updateViewport() {
        this.configureContext();
    }
    updateClearColor(color) {
        this.clearColor = rgbaToGpuColor(color);
    }
    destroy() {
        this.quads.length = 0;
        this.vertexBuffer?.destroy();
        this.vertexBuffer = null;
        this.vertexBufferSize = 0;
        this.context.unconfigure();
    }
}
//# sourceMappingURL=WebGpuRenderer.js.map