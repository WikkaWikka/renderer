/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2023 Comcast Cable Communications Management, LLC.
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
import { CoreNode, CoreNodeRenderState, UpdateType, } from './CoreNode.js';
import { makeCanvasTextCacheKey, } from './textures/CanvasTextTexture.js';
import { Matrix3d } from './lib/Matrix3d.js';
export var TextConstraint;
(function (TextConstraint) {
    TextConstraint[TextConstraint["none"] = 0] = "none";
    TextConstraint[TextConstraint["width"] = 1] = "width";
    TextConstraint[TextConstraint["height"] = 2] = "height";
    TextConstraint[TextConstraint["both"] = 3] = "both";
})(TextConstraint || (TextConstraint = {}));
export const DEFAULT_TEXT = '';
export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_FONT_FAMILY = 'sans-serif';
export const DEFAULT_FONT_STYLE = 'normal';
export const DEFAULT_TEXT_ALIGN = 'left';
export const DEFAULT_OFFSET_Y = 0;
export const DEFAULT_LETTER_SPACING = 0;
export const DEFAULT_LINE_HEIGHT = 1.2;
export const DEFAULT_MAX_LINES = 0;
export const DEFAULT_VERTICAL_ALIGN = 'top';
export const DEFAULT_OVERFLOW_SUFFIX = '...';
export const DEFAULT_WORD_BREAK = 'break-word';
export const DEFAULT_CONTAIN = 'none';
export class CoreTextNode extends CoreNode {
    textRenderer;
    fontHandler;
    _layoutGenerated = false;
    _waitingForFont = false;
    _containType = TextConstraint.none;
    _sdfCache = null;
    _canvasTexture = null;
    // Text renderer properties - stored directly on the node
    textProps;
    _renderInfo = null;
    constructor(stage, props, textRenderer) {
        super(stage, props);
        this.textRenderer = textRenderer;
        this.fontHandler = textRenderer.font;
        // Initialize text properties from props
        // Props are guaranteed to have all defaults resolved by Stage.createTextNode
        this.textProps = props;
        this._containType = TextConstraint[props.contain];
        this.setUpdateType(UpdateType.All);
    }
    onTextureLoaded = (_, dimensions) => {
        if (this.parentHasRenderTexture) {
            this.notifyParentRTTOfUpdate();
        }
        if (dimensions.w > 1 && dimensions.h > 1) {
            // Deferred to preserve text-before-texture 'loaded' ordering for
            // synchronous canvas uploads (see CoreNode.onTextureLoaded). Reuses
            // the inherited emit task so we don't recreate a closure per call.
            this.pendingTextureLoadedDimensions = dimensions;
            queueMicrotask(this.emitTextureLoadedTask);
        }
        this.setUpdateType(UpdateType.IsRenderable);
        this.stage.requestRender();
        if (this.stage.options.enableDirtyRepaints === true) {
            this.isQuadDirty = true;
        }
    };
    /**
     * Drop the cached SDF vertex data. The GPU buffers are shared (owned by the
     * renderer), so this only frees the per-node CPU snapshot. Safe to call from
     * destroy(), on text change, or when the node leaves the viewport.
     */
    releaseSdfCache() {
        this._sdfCache = null;
    }
    /**
     * Release this node's reference to its canvas text texture.
     *
     * @remarks
     * Textures are shared via the keyCache (see `makeCanvasTextCacheKey`), so
     * ownership/cancel decisions live on the texture itself
     * (`CanvasTextTexture.releaseOwner`): this only drops the node-side
     * reference. Safe to call multiple times.
     */
    releaseCanvasTexture() {
        const tex = this._canvasTexture;
        if (tex === null) {
            return;
        }
        // Null out first so a re-entrant call (e.g. triggered by the texture's
        // own 'freed' listener) can't double-release.
        this._canvasTexture = null;
        // The setter detaches listeners and node bookkeeping; releaseOwner drops
        // our ownership and aborts the in-flight load only when nobody remains.
        if (this.texture === tex) {
            this.texture = null;
        }
        tex.releaseOwner(this._id);
    }
    allowTextGeneration() {
        const p = this.props.parent;
        if (p === null) {
            return false;
        }
        if (p.worldAlpha > 0 && p.renderState > CoreNodeRenderState.OutOfBounds) {
            return true;
        }
        return false;
    }
    updateLocalTransform() {
        const p = this.props;
        let { x, y, w, h } = p;
        const mountX = p.mountX;
        const mountY = p.mountY;
        let mountTranslateX = p.mountX * w;
        let mountTranslateY = p.mountY * h;
        let localTextTransform = null;
        const tProps = this.textProps;
        const { textAlign, verticalAlign, maxWidth, maxHeight } = tProps;
        const contain = this._containType;
        const hasMaxWidth = maxWidth > 0;
        const hasMaxHeight = maxHeight > 0;
        if (contain > 0 && (hasMaxWidth || hasMaxHeight)) {
            let containX = 0;
            let containY = 0;
            if (contain & TextConstraint.width && hasMaxWidth === true) {
                if (textAlign === 'right') {
                    containX = maxWidth - w;
                }
                else if (textAlign === 'center') {
                    containX = (maxWidth - w) * 0.5;
                }
                mountTranslateX = mountX * maxWidth;
            }
            if (contain & TextConstraint.height && maxHeight > 0) {
                if (verticalAlign === 'bottom') {
                    containY = maxHeight - h;
                }
                else if (verticalAlign === 'middle') {
                    containY = (maxHeight - h) * 0.5;
                }
                mountTranslateY = mountY * maxHeight;
            }
            localTextTransform = Matrix3d.translate(containX, containY);
        }
        if (p.rotation !== 0 || p.scaleX !== 1 || p.scaleY !== 1) {
            const scaleRotate = Matrix3d.rotate(p.rotation).scale(p.scaleX, p.scaleY);
            const pivotW = contain & TextConstraint.width && maxWidth > 0 ? maxWidth : w;
            const pivotH = contain & TextConstraint.height && maxHeight > 0 ? maxHeight : h;
            const pivotTranslateX = p.pivotX * pivotW;
            const pivotTranslateY = p.pivotY * pivotH;
            this.localTransform = Matrix3d.translate(x - mountTranslateX + pivotTranslateX, y - mountTranslateY + pivotTranslateY, this.localTransform)
                .multiply(scaleRotate)
                .translate(-pivotTranslateX, -pivotTranslateY);
        }
        else {
            this.localTransform = Matrix3d.translate(x - mountTranslateX, y - mountTranslateY, this.localTransform);
        }
        if (localTextTransform !== null) {
            this.localTransform = this.localTransform.multiply(localTextTransform);
        }
    }
    /**
     * Override CoreNode's update method to handle text-specific updates
     */
    update(delta, parentClippingRect) {
        const hasValidText = typeof this.textProps.text === 'string' && this.textProps.text.length > 0;
        if (hasValidText === true &&
            (this.textProps.forceLoad === true ||
                this.allowTextGeneration() === true) &&
            this._layoutGenerated === false) {
            if (this.fontHandler.isFontLoaded(this.textProps.fontFamily) === true) {
                this._waitingForFont = false;
                this._renderInfo = null; // Clear any previous render info before generating new layout
                this.releaseSdfCache(); // Drop the stale SDF vertex cache
                const resp = this.textRenderer.renderText(this.textProps);
                this.handleRenderResult(resp);
                this._layoutGenerated = true;
            }
            else if (this._waitingForFont === false) {
                // Kick off a first-use load for registered-but-unstarted fonts
                // (cheap no-op otherwise), then join the waiter queue.
                this.fontHandler.requestLoad?.(this.stage, this.textProps.fontFamily);
                this.fontHandler.waitingForFont(this.textProps.fontFamily, this);
                this._waitingForFont = true;
            }
        }
        else if (hasValidText === false) {
            this.props.w = 0;
            this.props.h = 0;
            // If text is invalid, ensure node is not renderable
            this.setRenderable(false);
            this._layoutGenerated = false;
            this._renderInfo = null;
            this.releaseSdfCache(); // Drop the stale SDF vertex cache
            this.releaseCanvasTexture(); // Free the canvas text texture, text is no longer valid
        }
        // First run the standard CoreNode update
        super.update(delta, parentClippingRect);
    }
    /**
     * Override is renderable check for SDF text nodes
     */
    updateIsRenderable() {
        // Guard: Text nodes are never renderable without valid text
        const hasValidText = typeof this.textProps.text === 'string' && this.textProps.text.length > 0;
        const renderInfo = this._renderInfo;
        if (hasValidText === false || renderInfo === null) {
            this.setRenderable(false);
            return;
        }
        // SDF text nodes are always renderable if they have a valid layout
        if (renderInfo.type === 'canvas') {
            super.updateIsRenderable();
            return;
        }
        this.setRenderable(true);
    }
    /**
     * Handle the result of text rendering for both Canvas and SDF renderers
     */
    handleRenderResult(result) {
        // Host paths on top
        const textRendererType = result.type;
        let width = result.width;
        let height = result.height;
        // Handle zero-dimension case (can happen with certain text inputs or font issues)
        if (width === 0 || height === 0) {
            this.emit('failed', {
                type: 'text',
                error: new Error('Text rendering failed, width or height zero'),
            });
            return;
        }
        // Handle Canvas renderer (generates a fresh pixel source on load)
        if (textRendererType === 'canvas') {
            if (typeof result.renderSource !== 'function') {
                this.emit('failed', {
                    type: 'text',
                    error: new Error('Canvas text rendering failed, no source generator returned'),
                });
                return;
            }
            this.props.w = width;
            this.props.h = height;
            this.setUpdateType(UpdateType.Local);
            // It isn't renderable until the texture is loaded we have to set it to false here to avoid it
            // being detected as a renderable default color node in the next frame
            // it will be corrected once the texture is loaded
            this.setRenderable(false);
            // Release the previous canvas text texture before creating the new
            // one. With keyCache sharing this only drops our ownership (other
            // nodes may keep using it); reclamation happens via LRU cleanup.
            this.releaseCanvasTexture();
            const tProps = this.textProps;
            const newTexture = this.stage.txManager.createTexture('CanvasTextTexture', {
                render: result.renderSource,
                // textProps is passed by reference (no copy): the key builder only
                // reads it synchronously to build the key string.
                key: makeCanvasTextCacheKey(tProps),
            });
            this._canvasTexture = newTexture;
            this.texture = newTexture;
            if (this.renderState > CoreNodeRenderState.OutOfBounds) {
                // We do want the texture to load immediately
                this.texture.setRenderableOwner(this._id, true);
            }
        }
        else {
            const layout = result.layout;
            // For SDF, we rely on the presence of a valid layout to determine renderability
            if (layout === undefined) {
                this.emit('failed', {
                    type: 'text',
                    error: new Error('SDF text rendering failed, no layout data returned'),
                });
                return;
            }
            this.props.w = width;
            this.props.h = height;
            this.setUpdateType(UpdateType.Local);
            this.setRenderable(true);
            this.numQuads = layout.totalQuadCount;
            // Fresh CPU vertex cache — the previous one (if any) was tied to the old
            // layout and would only be evicted via a layoutRef mismatch anyway.
            this._sdfCache = {
                vertices: null,
                glyphCount: 0,
                color: 0,
                alpha: 0,
                transform: new Float32Array(6),
                layoutRef: null,
                lastStartQuad: 0,
                lastWriteDirty: false,
            };
            this.renderOpTextures = [result.atlasTexture];
        }
        this.emit('textCalculated', {
            type: 'text',
            dimensions: {
                w: width,
                h: height,
            },
        });
        this._renderInfo = result;
        queueMicrotask(this.emitTextLoadedEvent);
    }
    // Reusable bound method for emitting loaded event
    emitTextLoadedEvent = () => {
        if (this._renderInfo === null)
            return; // Guard against unexpected null
        this.emit('loaded', {
            type: 'text',
            dimensions: {
                w: this._renderInfo.width,
                h: this._renderInfo.height,
            },
        });
    };
    /**
     * Override renderQuads to handle SDF vs Canvas rendering
     */
    renderQuads(renderer) {
        if (this.parentHasRenderTexture === true) {
            const rtt = renderer.renderToTextureActive;
            if (rtt === false || this.parentRenderTexture !== renderer.activeRttNode)
                return;
        }
        // Early return if no renderInfo
        if (this._renderInfo === null) {
            return;
        }
        // Canvas renderer: use standard texture rendering via CoreNode
        if (this._renderInfo.type === 'canvas') {
            super.renderQuads(renderer);
            return;
        }
        // SDF renderer: submit glyphs into the renderer's shared batched SDF
        // buffer. The renderer merges consecutive text nodes into a single draw
        // call (see WebGlRenderer.addSdfQuads / finalizeSdfBatch).
        const layout = this._renderInfo.layout;
        this.textRenderer.renderQuads(renderer, layout, null, {
            fontFamily: this.textProps.fontFamily,
            fontSize: this.textProps.fontSize,
            color: this.props.color,
            offsetY: this.textProps.offsetY,
            worldAlpha: this.worldAlpha,
            globalTransform: this.globalTransform.getFloatArr(),
            clippingRect: this.clippingRect,
            width: layout.width,
            height: layout.height,
            parentHasRenderTexture: this.parentHasRenderTexture,
            framebufferDimensions: this.parentFramebufferDimensions,
            stage: this.stage,
            sdfCache: this._sdfCache ?? undefined,
        });
    }
    updateRenderState(renderState) {
        super.updateRenderState(renderState);
        if (this._renderInfo !== null &&
            this._renderInfo.type === 'sdf' &&
            renderState === CoreNodeRenderState.OutOfBounds) {
            this.releaseSdfCache();
        }
    }
    destroy() {
        if (this._waitingForFont === true) {
            this.fontHandler.stopWaitingForFont(this.textProps.fontFamily, this);
        }
        // Clear cached layout and vertex cache
        this._renderInfo = null;
        this.releaseSdfCache();
        this.releaseCanvasTexture();
        super.destroy();
    }
    set w(value) {
        this.maxWidth = value;
    }
    get w() {
        return this.props.w;
    }
    set h(value) {
        this.maxHeight = value;
    }
    get h() {
        return this.props.h;
    }
    get maxWidth() {
        return this.textProps.maxWidth;
    }
    set maxWidth(value) {
        if (this.textProps.maxWidth !== value) {
            this.textProps.maxWidth = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    // Property getters and setters
    get maxHeight() {
        return this.textProps.maxHeight;
    }
    set maxHeight(value) {
        if (this.textProps.maxHeight !== value) {
            this.textProps.maxHeight = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get contain() {
        return this.textProps.contain;
    }
    set contain(value) {
        value ||= DEFAULT_CONTAIN;
        if (this.textProps.contain !== value) {
            this.textProps.contain = value;
            this._containType = TextConstraint[value];
            this.setUpdateType(UpdateType.Local);
        }
    }
    get text() {
        return this.textProps.text;
    }
    set text(value) {
        let normalizedValue;
        if (value === undefined || value === null) {
            normalizedValue = DEFAULT_TEXT;
        }
        else if (typeof value !== 'string') {
            normalizedValue = String(value);
        }
        else {
            normalizedValue = value;
        }
        if (this.textProps.text !== normalizedValue) {
            this.textProps.text = normalizedValue;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get fontSize() {
        return this.textProps.fontSize;
    }
    set fontSize(value) {
        if (value === undefined) {
            value = DEFAULT_FONT_SIZE;
        }
        if (this.textProps.fontSize !== value) {
            this.textProps.fontSize = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get fontFamily() {
        return this.textProps.fontFamily;
    }
    set fontFamily(value) {
        value ||= DEFAULT_FONT_FAMILY;
        if (this.textProps.fontFamily !== value) {
            if (this._waitingForFont === true) {
                this.fontHandler.stopWaitingForFont(this.textProps.fontFamily, this);
            }
            this.textProps.fontFamily = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get fontStyle() {
        return this.textProps.fontStyle;
    }
    set fontStyle(value) {
        value ||= DEFAULT_FONT_STYLE;
        if (this.textProps.fontStyle !== value) {
            this.textProps.fontStyle = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get textAlign() {
        return this.textProps.textAlign;
    }
    set textAlign(value) {
        value ||= DEFAULT_TEXT_ALIGN;
        if (this.textProps.textAlign !== value) {
            this.textProps.textAlign = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get letterSpacing() {
        return this.textProps.letterSpacing;
    }
    set letterSpacing(value) {
        value ||= DEFAULT_LETTER_SPACING;
        if (this.textProps.letterSpacing !== value) {
            this.textProps.letterSpacing = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get lineHeight() {
        return this.textProps.lineHeight;
    }
    set lineHeight(value) {
        if (value === undefined) {
            value = DEFAULT_LINE_HEIGHT;
        }
        if (this.textProps.lineHeight !== value) {
            this.textProps.lineHeight = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get maxLines() {
        return this.textProps.maxLines;
    }
    set maxLines(value) {
        value ||= DEFAULT_MAX_LINES;
        if (this.textProps.maxLines !== value) {
            this.textProps.maxLines = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get verticalAlign() {
        return this.textProps.verticalAlign;
    }
    set verticalAlign(value) {
        value ||= DEFAULT_VERTICAL_ALIGN;
        if (this.textProps.verticalAlign !== value) {
            this.textProps.verticalAlign = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get overflowSuffix() {
        return this.textProps.overflowSuffix;
    }
    set overflowSuffix(value) {
        if (value === undefined) {
            value = DEFAULT_OVERFLOW_SUFFIX;
        }
        if (this.textProps.overflowSuffix !== value) {
            this.textProps.overflowSuffix = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get wordBreak() {
        return this.textProps.wordBreak;
    }
    set wordBreak(value) {
        value ||= DEFAULT_WORD_BREAK;
        if (this.textProps.wordBreak !== value) {
            this.textProps.wordBreak = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get offsetY() {
        return this.textProps.offsetY;
    }
    set offsetY(value) {
        value ||= DEFAULT_OFFSET_Y;
        if (this.textProps.offsetY !== value) {
            this.textProps.offsetY = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get forceLoad() {
        return this.textProps.forceLoad;
    }
    set forceLoad(value) {
        if (this.textProps.forceLoad !== value) {
            this.textProps.forceLoad = value;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get richText() {
        return this.textProps.richText;
    }
    set richText(value) {
        if (this.textProps.richText !== value) {
            this.textProps.richText = value;
            this._layoutGenerated = false;
            this.setUpdateType(UpdateType.Local);
        }
    }
    get renderInfo() {
        return this._renderInfo;
    }
}
//# sourceMappingURL=CoreTextNode.js.map