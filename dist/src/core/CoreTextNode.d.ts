import type { TextRenderer, TrProps, TextRenderInfo } from './text-rendering/TextRenderer.js';
import { CoreNode, CoreNodeRenderState, type CoreNodeProps } from './CoreNode.js';
import type { Stage } from './Stage.js';
import type { RectWithValid } from './lib/utils.js';
import type { CoreRenderer } from './renderers/CoreRenderer.js';
import type { TextureLoadedEventHandler } from './textures/Texture.js';
export interface CoreTextNodeProps extends CoreNodeProps, TrProps {
    /**
     * Force Text Node to use a specific Text Renderer
     */
    textRendererOverride?: string | null;
    forceLoad: boolean;
}
export declare enum TextConstraint {
    none = 0,
    width = 1,
    height = 2,
    both = 3
}
export declare const DEFAULT_TEXT = "";
export declare const DEFAULT_FONT_SIZE = 16;
export declare const DEFAULT_FONT_FAMILY = "sans-serif";
export declare const DEFAULT_FONT_STYLE = "normal";
export declare const DEFAULT_TEXT_ALIGN = "left";
export declare const DEFAULT_OFFSET_Y = 0;
export declare const DEFAULT_LETTER_SPACING = 0;
export declare const DEFAULT_LINE_HEIGHT = 1.2;
export declare const DEFAULT_MAX_LINES = 0;
export declare const DEFAULT_VERTICAL_ALIGN = "top";
export declare const DEFAULT_OVERFLOW_SUFFIX = "...";
export declare const DEFAULT_WORD_BREAK = "break-word";
export declare const DEFAULT_CONTAIN = "none";
export declare class CoreTextNode extends CoreNode implements CoreTextNodeProps {
    private textRenderer;
    private fontHandler;
    private _layoutGenerated;
    private _waitingForFont;
    private _containType;
    private _sdfCache;
    private _canvasTexture;
    textProps: CoreTextNodeProps;
    private _renderInfo;
    constructor(stage: Stage, props: CoreTextNodeProps, textRenderer: TextRenderer);
    protected onTextureLoaded: TextureLoadedEventHandler;
    /**
     * Drop the cached SDF vertex data. The GPU buffers are shared (owned by the
     * renderer), so this only frees the per-node CPU snapshot. Safe to call from
     * destroy(), on text change, or when the node leaves the viewport.
     */
    private releaseSdfCache;
    /**
     * Release this node's reference to its canvas text texture.
     *
     * @remarks
     * Textures are shared via the keyCache (see `makeCanvasTextCacheKey`), so
     * ownership/cancel decisions live on the texture itself
     * (`CanvasTextTexture.releaseOwner`): this only drops the node-side
     * reference. Safe to call multiple times.
     */
    private releaseCanvasTexture;
    allowTextGeneration(): boolean;
    updateLocalTransform(): void;
    /**
     * Override CoreNode's update method to handle text-specific updates
     */
    update(delta: number, parentClippingRect: RectWithValid): void;
    /**
     * Override is renderable check for SDF text nodes
     */
    updateIsRenderable(): void;
    /**
     * Handle the result of text rendering for both Canvas and SDF renderers
     */
    private handleRenderResult;
    private emitTextLoadedEvent;
    /**
     * Override renderQuads to handle SDF vs Canvas rendering
     */
    renderQuads(renderer: CoreRenderer): void;
    updateRenderState(renderState: CoreNodeRenderState): void;
    destroy(): void;
    set w(value: number);
    get w(): number;
    set h(value: number);
    get h(): number;
    get maxWidth(): number;
    set maxWidth(value: number);
    get maxHeight(): number;
    set maxHeight(value: number);
    get contain(): TrProps['contain'];
    set contain(value: TrProps['contain'] | undefined);
    get text(): string;
    set text(value: string | undefined);
    get fontSize(): number;
    set fontSize(value: number | undefined);
    get fontFamily(): string;
    set fontFamily(value: string | undefined);
    get fontStyle(): TrProps['fontStyle'];
    set fontStyle(value: TrProps['fontStyle'] | undefined);
    get textAlign(): TrProps['textAlign'];
    set textAlign(value: TrProps['textAlign'] | undefined);
    get letterSpacing(): number;
    set letterSpacing(value: number | undefined);
    get lineHeight(): number;
    set lineHeight(value: number | undefined);
    get maxLines(): number;
    set maxLines(value: number | undefined);
    get verticalAlign(): TrProps['verticalAlign'];
    set verticalAlign(value: TrProps['verticalAlign'] | undefined);
    get overflowSuffix(): string;
    set overflowSuffix(value: string | undefined);
    get wordBreak(): TrProps['wordBreak'];
    set wordBreak(value: TrProps['wordBreak'] | undefined);
    get offsetY(): number;
    set offsetY(value: number | undefined);
    get forceLoad(): boolean;
    set forceLoad(value: boolean);
    get richText(): boolean;
    set richText(value: boolean);
    get renderInfo(): TextRenderInfo | null;
}
