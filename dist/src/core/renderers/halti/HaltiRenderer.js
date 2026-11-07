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
import { CoreContextTexture } from '../CoreContextTexture.js';
import { CoreRenderer } from '../CoreRenderer.js';
import { CoreShaderNode } from '../CoreShaderNode.js';
import { HaltiContextTexture, HaltiSubTexture } from './HaltiContextTexture.js';
import { decomposeHaltiTransform, resolveHaltiContainerLayout, rgbaToCssHex, } from './internal/RendererUtils.js';
const TRANSPARENT = '#00000000';
export class HaltiRenderer extends CoreRenderer {
    mode = 'halti';
    renderToTextureActive = false;
    activeRttNode = null;
    options;
    records = new Map();
    frameRecords = [];
    warnedGradients = new WeakSet();
    warnedShaders = new WeakSet();
    warnedSkew = new WeakSet();
    frame = 0;
    renderedQuads = 0;
    lastFrameCompletion = Promise.resolve();
    constructor(stage) {
        super(stage);
        const options = stage.options.halti;
        if (options === null) {
            throw new Error('HaltiRenderer requires settings.halti with a root and widget factory.');
        }
        this.options = options;
        this.configureRoot();
    }
    reset() {
        this.frame++;
        this.renderedQuads = 0;
        this.frameRecords.length = 0;
    }
    addQuad(node) {
        const clippingRect = node.clippingRect;
        if (clippingRect.valid === true &&
            (clippingRect.w <= 0 || clippingRect.h <= 0)) {
            return;
        }
        let record = this.records.get(node);
        if (record === undefined) {
            record = this.createRecord(node);
            this.records.set(node, record);
        }
        record.frame = this.frame;
        this.applyNode(record, node, this.frameRecords.length);
        this.frameRecords.push(record);
        this.renderedQuads++;
    }
    render() {
        for (const record of this.frameRecords) {
            this.options.root.appendChild(record.container);
        }
        for (const [node, record] of this.records) {
            if (record.frame === this.frame)
                continue;
            this.destroyRecord(record);
            this.records.delete(node);
        }
        const completion = this.options.ensureFrameRendered?.();
        this.lastFrameCompletion = Promise.resolve(completion).catch((error) => {
            this.warn(`Halti frame completion failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        });
    }
    waitForFrame() {
        return this.lastFrameCompletion;
    }
    createRecord(node) {
        const container = this.options.createWidget();
        const content = this.options.createWidget();
        container.name = `lightning-halti-container-${node.id}`;
        content.name = `lightning-halti-node-${node.id}`;
        container.appendChild(content);
        return { container, content, frame: this.frame };
    }
    applyNode(record, node, drawOrder) {
        const transform = node.globalTransform;
        if (transform === undefined)
            return;
        const containerLayout = resolveHaltiContainerLayout(node.clippingRect, this.stage.options.appWidth, this.stage.options.appHeight);
        const decomposed = decomposeHaltiTransform(transform);
        const { container, content } = record;
        container.x = containerLayout.x;
        container.y = containerLayout.y;
        container.width = containerLayout.width;
        container.height = containerLayout.height;
        container.clip = containerLayout.clip;
        container.visible = true;
        container.opacity = 1;
        container.color = TRANSPARENT;
        container.drawOrder = drawOrder;
        content.x = decomposed.x - containerLayout.contentOffsetX;
        content.y = decomposed.y - containerLayout.contentOffsetY;
        content.width = node.props.w;
        content.height = node.props.h;
        content.scaleX = decomposed.scaleX;
        content.scaleY = decomposed.scaleY;
        content.rotateZ = decomposed.rotation;
        content.transformOriginX = 0;
        content.transformOriginY = 0;
        content.opacity = node.worldAlpha;
        content.visible = true;
        content.clip = false;
        content.drawOrder = drawOrder;
        const color = node.props.colorTl >>> 0;
        const hasGradient = node.props.colorTr !== node.props.colorTl ||
            node.props.colorBl !== node.props.colorTl ||
            node.props.colorBr !== node.props.colorTl;
        if (hasGradient && !this.warnedGradients.has(node)) {
            this.warnedGradients.add(node);
            this.warn('HaltiRenderer currently reduces Lightning corner gradients to the top-left color.');
        }
        if (decomposed.hasSkew && !this.warnedSkew.has(node)) {
            this.warnedSkew.add(node);
            this.warn('HaltiRenderer currently reduces skewed matrices to translation, rotation, and scale.');
        }
        if (node.props.shader !== null && !this.warnedShaders.has(node)) {
            this.warnedShaders.add(node);
            this.warn('HaltiRenderer does not yet translate Lightning custom shaders or effects.');
        }
        const texture = (node.props.texture ||
            this.stage.defaultTexture);
        const presentation = this.texturePresentation(texture, color);
        if (presentation.url === null) {
            content.color = rgbaToCssHex(color);
            this.clearImage(content);
        }
        else {
            content.color = TRANSPARENT;
            const image = this.imageFor(content);
            image.url = presentation.url;
            image.halign = 'stretch';
            image.valign = 'stretch';
            image.sourceRect = presentation.sourceRect;
        }
    }
    texturePresentation(texture, color) {
        const contextTexture = texture.loadCtxTexture();
        contextTexture.load();
        if (contextTexture instanceof HaltiSubTexture) {
            return {
                url: contextTexture.getUrl(color),
                sourceRect: contextTexture.sourceRect,
            };
        }
        if (contextTexture instanceof HaltiContextTexture) {
            return { url: contextTexture.getUrl(color) };
        }
        return { url: null };
    }
    imageFor(widget) {
        if (widget.image === undefined)
            widget.image = {};
        return widget.image;
    }
    clearImage(widget) {
        if (widget.image === undefined)
            return;
        widget.image.url = undefined;
        widget.image.sourceRect = undefined;
    }
    configureRoot() {
        const root = this.options.root;
        root.name ??= 'lightning-halti-root';
        root.x = 0;
        root.y = 0;
        root.width = this.stage.options.appWidth;
        root.height = this.stage.options.appHeight;
        root.clip = true;
        root.visible = true;
        root.color = rgbaToCssHex(this.stage.clearColor);
    }
    destroyRecord(record) {
        record.content.parent = undefined;
        record.content.destroy?.();
        record.container.parent = undefined;
        record.container.destroy?.();
    }
    warn(message) {
        if (this.options.warn !== undefined) {
            this.options.warn(message);
        }
        else {
            console.warn(message);
        }
    }
    createCtxTexture(textureSource) {
        if (textureSource instanceof SubTexture) {
            return new HaltiSubTexture(this.stage.txMemManager, textureSource);
        }
        return new HaltiContextTexture(this.stage.txMemManager, textureSource);
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
        // Render-to-texture is outside the Halti spike.
    }
    removeRTTNode(node) {
        const index = this.rttNodes.indexOf(node);
        if (index >= 0)
            this.rttNodes.splice(index, 1);
    }
    renderToTexture() {
        // Render-to-texture is outside the Halti spike.
    }
    getBufferInfo() {
        return {
            totalUsed: this.records.size * 2,
            totalAvailable: this.records.size * 2,
        };
    }
    getQuadCount() {
        return this.renderedQuads;
    }
    updateViewport() {
        this.configureRoot();
    }
    updateClearColor(color) {
        this.options.root.color = rgbaToCssHex(color);
    }
    destroy() {
        for (const record of this.records.values()) {
            this.destroyRecord(record);
        }
        this.records.clear();
        this.frameRecords.length = 0;
    }
}
//# sourceMappingURL=HaltiRenderer.js.map