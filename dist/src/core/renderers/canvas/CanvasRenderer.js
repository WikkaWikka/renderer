import { SubTexture } from '../../textures/SubTexture.js';
import { TextureType } from '../../textures/Texture.js';
import { CoreRenderer } from '../CoreRenderer.js';
import { CanvasTexture } from './CanvasTexture.js';
import { parseColor } from '../../lib/colorParser.js';
import { CanvasShaderNode } from './CanvasShaderNode.js';
import { normalizeCanvasColor, normalizeCanvasColorArgb, } from '../../lib/colorCache.js';
export class CanvasRenderer extends CoreRenderer {
    context;
    canvas;
    pixelRatio;
    clearColor;
    renderToTextureActive = false;
    activeRttNode = null;
    constructor(stage) {
        super(stage);
        this.mode = 'canvas';
        const platform = stage.platform;
        const canvas = platform.canvas;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.pixelRatio = stage.pixelRatio;
        this.clearColor = normalizeCanvasColor(stage.clearColor);
    }
    reset() {
        this.canvas.width = this.canvas.width; // quick reset canvas
        const ctx = this.context;
        if (this.clearColor) {
            ctx.fillStyle = this.clearColor;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        ctx.scale(this.pixelRatio, this.pixelRatio);
    }
    render() {
        // noop
    }
    addQuad(node) {
        const ctx = this.context;
        const { tx, ty, ta, tb, tc, td } = node.globalTransform;
        const clippingRect = node.clippingRect;
        let texture = (node.props.texture || this.stage.defaultTexture);
        // The Canvas2D renderer only supports image textures, no textures are used for color blocks
        if (texture !== null) {
            const textureType = texture.type;
            if (textureType !== TextureType.image &&
                textureType !== TextureType.subTexture &&
                textureType !== TextureType.color &&
                textureType !== TextureType.noise) {
                return;
            }
        }
        const hasTransform = ta !== 1;
        const clippingValid = clippingRect.valid === true;
        // If the clipping rect is valid but zero-area, the node is fully clipped — skip rendering
        if (clippingValid === true &&
            clippingRect.w === 0 &&
            clippingRect.h === 0) {
            return;
        }
        const hasClipping = clippingValid === true && clippingRect.w !== 0 && clippingRect.h !== 0;
        const shader = node.props.shader;
        const hasShader = shader !== null;
        let saveAndRestore = hasTransform === true || hasClipping === true;
        if (hasShader === true) {
            saveAndRestore = saveAndRestore || shader.applySNR;
        }
        if (saveAndRestore) {
            ctx.save();
        }
        if (hasClipping === true) {
            ctx.beginPath();
            const { x, y, w, h, clipRadius } = clippingRect;
            if (clipRadius > 0) {
                const r = Math.min(clipRadius, w / 2, h / 2);
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
            }
            else {
                ctx.rect(x, y, w, h);
            }
            ctx.clip();
        }
        if (hasTransform === true) {
            // Quad transform:
            // | ta tb tx |
            // | tc td ty |
            // | 0  0  1  |
            // C2D transform:
            // | a  c  e  |
            // | b  d  f  |
            // | 0  0  1  |
            const scale = this.pixelRatio;
            ctx.setTransform(ta, tc, tb, td, tx * scale, ty * scale);
            ctx.scale(scale, scale);
            ctx.translate(-tx, -ty);
        }
        if (hasShader === true) {
            let renderContext = () => {
                this.renderContext(node, texture);
            };
            shader.render(ctx, node, renderContext);
            renderContext = null;
        }
        else {
            this.renderContext(node, texture);
        }
        if (saveAndRestore) {
            ctx.restore();
        }
    }
    renderContext(node, texture) {
        const color = node.premultipliedColorTl;
        const textureType = texture.type;
        const tx = node.globalTransform.tx;
        const ty = node.globalTransform.ty;
        const width = node.props.w;
        const height = node.props.h;
        if (textureType !== TextureType.color) {
            const tintColor = parseColor(color);
            if (textureType !== TextureType.subTexture) {
                const image = texture.ctxTexture.getImage(tintColor);
                if (image === null) {
                    return;
                }
                this.context.globalAlpha = tintColor.a ?? node.worldAlpha;
                this.context.drawImage(image, tx, ty, width, height);
                this.context.globalAlpha = 1;
                return;
            }
            const image = texture.parentTexture.ctxTexture.getImage(tintColor);
            if (image === null) {
                return;
            }
            const props = texture.props;
            this.context.globalAlpha = tintColor.a ?? node.worldAlpha;
            this.context.drawImage(image, props.x, props.y, props.w, props.h, tx, ty, width, height);
            this.context.globalAlpha = 1;
            return;
        }
        const hasGradient = node.premultipliedColorTl !== node.premultipliedColorTr ||
            node.premultipliedColorTl !== node.premultipliedColorBr;
        if (hasGradient === true) {
            let endX = tx;
            let endY = ty;
            let endColor;
            if (node.premultipliedColorTl === node.premultipliedColorTr) {
                // vertical
                endX = tx;
                endY = ty + height;
                endColor = node.premultipliedColorBr;
            }
            else {
                // horizontal
                endX = tx + width;
                endY = ty;
                endColor = node.premultipliedColorTr;
            }
            const gradient = this.context.createLinearGradient(tx, ty, endX, endY);
            gradient.addColorStop(0, normalizeCanvasColorArgb(color));
            gradient.addColorStop(1, normalizeCanvasColorArgb(endColor));
            this.context.fillStyle = gradient;
            this.context.fillRect(tx, ty, width, height);
        }
        else {
            this.context.fillStyle = normalizeCanvasColorArgb(color);
            this.context.fillRect(tx, ty, width, height);
        }
    }
    createShaderNode(shaderKey, shaderType, props) {
        return new CanvasShaderNode(shaderKey, shaderType, this.stage, props);
    }
    createShaderProgram(_shaderConfig) {
        return null;
    }
    supportsShaderType(shaderType) {
        return shaderType.render !== undefined;
    }
    createCtxTexture(textureSource) {
        return new CanvasTexture(this.stage.txMemManager, textureSource);
    }
    renderRTTNodes() {
        // noop
    }
    removeRTTNode(_node) {
        // noop
    }
    renderToTexture(_node) {
        // noop
    }
    getBufferInfo() {
        return null;
    }
    getQuadCount() {
        return null;
    }
    /**
     * Updates the clear color of the canvas renderer.
     *
     * @param color - The color to set as the clear color.
     */
    updateClearColor(color) {
        this.clearColor = normalizeCanvasColor(color);
    }
    updateViewport() {
        // noop
    }
    getDefaultShaderNode() {
        return null;
    }
    destroy() {
        // Release canvas 2D context by resizing canvas to 0
        this.canvas.width = 0;
        this.canvas.height = 0;
    }
}
//# sourceMappingURL=CanvasRenderer.js.map