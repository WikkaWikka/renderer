import type { TextureOptions } from './CoreTextureManager.js';
import type { WebGlRenderer } from './renderers/webgl/WebGlRenderer.js';
import type { WebGlCtxTexture } from './renderers/webgl/WebGlCtxTexture.js';
import { type BufferCollection } from './renderers/webgl/internal/BufferCollection.js';
import type { CoreRenderer } from './renderers/CoreRenderer.js';
import type { Stage } from './Stage.js';
import { type Texture, type TextureCoords, type TextureLoadedEventHandler } from './textures/Texture.js';
import type { Dimensions } from '../common/CommonTypes.js';
import { EventEmitter } from '../common/EventEmitter.js';
import { type Bound, type RectWithValid } from './lib/utils.js';
import { Matrix3d } from './lib/Matrix3d.js';
import { RenderCoords } from './lib/RenderCoords.js';
import type { AnimationSettings } from './animations/CoreAnimation.js';
import type { IAnimationController } from '../common/IAnimationController.js';
import type { CoreShaderNode } from './renderers/CoreShaderNode.js';
import { Autosizer } from './Autosizer.js';
export declare enum CoreNodeRenderState {
    Init = 0,
    OutOfBounds = 2,
    InBounds = 4,
    InViewport = 8
}
export declare enum UpdateType {
    /**
     * Child updates
     */
    Children = 1,
    /**
     * localTransform
     *
     * @remarks
     * CoreNode Properties Updated:
     * - `localTransform`
     */
    Local = 2,
    /**
     * globalTransform
     *
     * * @remarks
     * CoreNode Properties Updated:
     * - `globalTransform`
     * - `renderBounds`
     * - `renderCoords`
     */
    Global = 4,
    /**
     * Clipping rect update
     *
     * @remarks
     * CoreNode Properties Updated:
     * - `clippingRect`
     */
    Clipping = 8,
    /**
     * Sort Z-Index Children update
     *
     * @remarks
     * CoreNode Properties Updated:
     * - `children` (sorts children by their `calcZIndex`)
     */
    SortZIndexChildren = 16,
    /**
     * Premultiplied Colors update
     *
     * @remarks
     * CoreNode Properties Updated:
     * - `premultipliedColorTl`
     * - `premultipliedColorTr`
     * - `premultipliedColorBl`
     * - `premultipliedColorBr`
     */
    PremultipliedColors = 32,
    /**
     * World Alpha update
     *
     * @remarks
     * CoreNode Properties Updated:
     * - `worldAlpha` = `parent.worldAlpha` * `alpha`
     */
    WorldAlpha = 64,
    /**
     * Render State update
     *
     * @remarks
     * CoreNode Properties Updated:
     * - `renderState`
     */
    RenderState = 128,
    /**
     * Is Renderable update
     *
     * @remarks
     * CoreNode Properties Updated:
     * - `isRenderable`
     */
    IsRenderable = 256,
    /**
     * Render Texture update
     */
    RenderTexture = 512,
    /**
     * Track if parent has render texture
     */
    ParentRenderTexture = 1024,
    /**
     * Render Bounds update
     */
    RenderBounds = 2048,
    /**
     * RecalcUniforms
     */
    RecalcUniforms = 4096,
    /**
     * Autosize update
     */
    Autosize = 8192,
    /**
     * None
     */
    None = 0,
    /**
     * All
     */
    All = 16383
}
/**
 * A custom data map which can be stored on an CoreNode
 *
 * @remarks
 * This is a map of key-value pairs that can be stored on an INode. It is used
 * to store custom data that can be used by the application.
 * The data stored can only be of type string, number or boolean.
 */
export type CustomDataMap = {
    [key: string]: string | number | boolean | undefined;
};
/**
 * Writable properties of a Node.
 */
export interface CoreNodeProps {
    /**
     * The x coordinate of the Node's Mount Point.
     *
     * @remarks
     * See {@link mountX} and {@link mountY} for more information about setting
     * the Mount Point.
     *
     * @default `0`
     */
    x: number;
    /**
     * The y coordinate of the Node's Mount Point.
     *
     * @remarks
     * See {@link mountX} and {@link mountY} for more information about setting
     * the Mount Point.
     *
     * @default `0`
     */
    y: number;
    /**
     * The width of the Node.
     * @warning This will be deprecated in favor of `w` and `h` properties in the future.
     *
     * @default `0`
     */
    w: number;
    /**
     * The height of the Node.
     * @warning This will be deprecated in favor of `w` and `h` properties in the future.
     *
     * @default `0`
     */
    h: number;
    /**
     * The alpha opacity of the Node.
     *
     * @remarks
     * The alpha value is a number between 0 and 1, where 0 is fully transparent
     * and 1 is fully opaque.
     *
     * @default `1`
     */
    alpha: number;
    /**
     * Autosize
     *
     * @remarks
     * When enabled, the Node automatically resizes based on its content
     *
     * **Texture Autosize Mode:**
     * - When the Node has a texture, it automatically resizes to match the
     *   texture's dimensions when the texture loads
     * - This ensures images display at their natural size without manual sizing
     * - Text Nodes always use this mode regardless of this setting
     *
     * **Children Autosize Mode:**
     * - When the Node has no texture but contains children, it automatically
     *   resizes to encompass all children's bounds
     * - Calculates the bounding box that contains all child positions, dimensions,
     *   and transforms (scale, rotation, mount/pivot points)
     * - Creates container behavior where the parent grows to fit its content
     * - Updates dynamically as children are added, removed, or transformed
     *
     * **Mode Selection Logic:**
     * - Texture mode takes precedence over children mode
     * - Mode switches automatically when texture is added/removed
     * - If no texture and no children, autosize has no effect
     *
     * **Performance:**
     * - Children mode uses efficient transform caching and differential updates
     * - Only recalculates when child transforms actually change
     * - Minimal memory allocation with factory function patterns
     *
     *
     * @default `false`
     */
    autosize: boolean;
    /**
     * Margin around the Node's bounds for preloading
     *
     * @default `null`
     */
    boundsMargin: number | [number, number, number, number] | null;
    /**
     * Clipping Mode
     *
     * @remarks
     * Enable Clipping Mode when you want to prevent the drawing of a Node and
     * its descendants from overflowing outside of the Node's x/y/width/height
     * bounds.
     *
     * For WebGL, clipping is implemented using the high-performance WebGL
     * operation scissor. As a consequence, clipping does not work for
     * non-rectangular areas. So, if the element is rotated
     * (by itself or by any of its ancestors), clipping will not work as intended.
     *
     * TODO: Add support for non-rectangular clipping either automatically or
     * via Render-To-Texture.
     *
     * @default `false`
     */
    clipping: boolean;
    /**
     * Rounded corner radius for clipping (WebGL only).
     *
     * @remarks
     * When set to a value greater than 0 and `clipping` is `true`, children are
     * clipped to a rounded rectangle instead of a sharp rectangle. The stencil
     * buffer is used to achieve this — the scissor test still provides the coarse
     * axis-aligned bounds for performance, and the stencil pass applies the
     * rounded corners.
     *
     * Has no effect on the Canvas renderer.
     * Has no effect when `clipping` is `false`.
     * Has no effect when the node is rotated.
     *
     * @default `0`
     */
    clipRadius: number;
    /**
     * The color of the Node.
     *
     * @remarks
     * The color value is a number in the format 0xRRGGBBAA, where RR is the red
     * component, GG is the green component, BB is the blue component, and AA is
     * the alpha component.
     *
     * Gradient colors may be set by setting the different color sub-properties:
     * {@link colorTop}, {@link colorBottom}, {@link colorLeft}, {@link colorRight},
     * {@link colorTl}, {@link colorTr}, {@link colorBr}, {@link colorBl} accordingly.
     *
     * @default `0xffffffff` (opaque white)
     */
    color: number;
    /**
     * The color of the top edge of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorTop: number;
    /**
     * The color of the bottom edge of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorBottom: number;
    /**
     * The color of the left edge of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorLeft: number;
    /**
     * The color of the right edge of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorRight: number;
    /**
     * The color of the top-left corner of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorTl: number;
    /**
     * The color of the top-right corner of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorTr: number;
    /**
     * The color of the bottom-right corner of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorBr: number;
    /**
     * The color of the bottom-left corner of the Node for gradient rendering.
     *
     * @remarks
     * See {@link color} for more information about color values and gradient
     * rendering.
     */
    colorBl: number;
    /**
     * The Node's parent Node.
     *
     * @remarks
     * The value `null` indicates that the Node has no parent. This may either be
     * because the Node is the root Node of the scene graph, or because the Node
     * has been removed from the scene graph.
     *
     * In order to make sure that a Node can be rendered on the screen, it must
     * be added to the scene graph by setting it's parent property to a Node that
     * is already in the scene graph such as the root Node.
     *
     * @default `null`
     */
    parent: CoreNode | null;
    /**
     * The Node's z-index.
     *
     * @remarks
     * Max z-index of children under the same parent determines which child
     * is rendered on top. Higher z-index means the Node is rendered on top of
     * children with lower z-index.
     *
     * Max value is 1000 and min value is -1000. Values outside of this range will be clamped.
     */
    zIndex: number;
    /**
     * The Node's Texture.
     *
     * @remarks
     * The `texture` defines a rasterized image that is contained within the
     * {@link width} and {@link height} dimensions of the Node. If null, the
     * Node will use an opaque white {@link ColorTexture} when being drawn, which
     * essentially enables colors (including gradients) to be drawn.
     *
     * If set, by default, the texture will be drawn, as is, stretched to the
     * dimensions of the Node. This behavior can be modified by setting the TBD
     * and TBD properties.
     *
     * To create a Texture in order to set it on this property, call
     * {@link RendererMain.createTexture}.
     *
     * If the {@link src} is set on a Node, the Node will use the
     * {@link ImageTexture} by default and the Node will simply load the image at
     * the specified URL.
     *
     * Note: If this is a Text Node, the Texture will be managed by the Node's
     * {@link TextRenderer} and should not be set explicitly.
     */
    texture: Texture | null;
    /**
     * Options to associate with the Node's Texture
     */
    textureOptions: TextureOptions;
    /**
     * The Node's shader
     *
     * @remarks
     * The `shader` defines a {@link Shader} used to draw the Node. By default,
     * the Default Shader is used which simply draws the defined {@link texture}
     * or {@link color}(s) within the Node without any special effects.
     *
     * To create a Shader in order to set it on this property, call
     * {@link RendererMain.createShader}.
     *
     * Note: If this is a Text Node, the Shader will be managed by the Node's
     * {@link TextRenderer} and should not be set explicitly.
     */
    shader: CoreShaderNode<any> | null;
    /**
     * Image URL
     *
     * @remarks
     * When set, the Node's {@link texture} is automatically set to an
     * {@link ImageTexture} using the source image URL provided (with all other
     * settings being defaults)
     */
    src: string | null;
    /**
     * Scale to render the Node at
     *
     * @remarks
     * The scale value multiplies the provided {@link width} and {@link height}
     * of the Node around the Node's Pivot Point (defined by the {@link pivot}
     * props).
     *
     * Behind the scenes, setting this property sets both the {@link scaleX} and
     * {@link scaleY} props to the same value.
     *
     * NOTE: When the scaleX and scaleY props are explicitly set to different values,
     * this property returns `null`. Setting `null` on this property will have no
     * effect.
     *
     * @default 1.0
     */
    scale: number | null;
    /**
     * Scale to render the Node at (X-Axis)
     *
     * @remarks
     * The scaleX value multiplies the provided {@link width} of the Node around
     * the Node's Pivot Point (defined by the {@link pivot} props).
     *
     * @default 1.0
     */
    scaleX: number;
    /**
     * Scale to render the Node at (Y-Axis)
     *
     * @remarks
     * The scaleY value multiplies the provided {@link height} of the Node around
     * the Node's Pivot Point (defined by the {@link pivot} props).
     *
     * @default 1.0
     */
    scaleY: number;
    /**
     * Combined position of the Node's Mount Point
     *
     * @remarks
     * The value can be any number between `0.0` and `1.0`:
     * - `0.0` defines the Mount Point at the top-left corner of the Node.
     * - `0.5` defines it at the center of the Node.
     * - `1.0` defines it at the bottom-right corner of the node.
     *
     * Use the {@link mountX} and {@link mountY} props seperately for more control
     * of the Mount Point.
     *
     * When assigned, the same value is also passed to both the {@link mountX} and
     * {@link mountY} props.
     *
     * @default 0 (top-left)
     */
    mount: number;
    /**
     * X position of the Node's Mount Point
     *
     * @remarks
     * The value can be any number between `0.0` and `1.0`:
     * - `0.0` defines the Mount Point's X position as the left-most edge of the
     *   Node
     * - `0.5` defines it as the horizontal center of the Node
     * - `1.0` defines it as the right-most edge of the Node.
     *
     * The combination of {@link mountX} and {@link mountY} define the Mount Point
     *
     * @default 0 (left-most edge)
     */
    mountX: number;
    /**
     * Y position of the Node's Mount Point
     *
     * @remarks
     * The value can be any number between `0.0` and `1.0`:
     * - `0.0` defines the Mount Point's Y position as the top-most edge of the
     *   Node
     * - `0.5` defines it as the vertical center of the Node
     * - `1.0` defines it as the bottom-most edge of the Node.
     *
     * The combination of {@link mountX} and {@link mountY} define the Mount Point
     *
     * @default 0 (top-most edge)
     */
    mountY: number;
    /**
     * Combined position of the Node's Pivot Point
     *
     * @remarks
     * The value can be any number between `0.0` and `1.0`:
     * - `0.0` defines the Pivot Point at the top-left corner of the Node.
     * - `0.5` defines it at the center of the Node.
     * - `1.0` defines it at the bottom-right corner of the node.
     *
     * Use the {@link pivotX} and {@link pivotY} props seperately for more control
     * of the Pivot Point.
     *
     * When assigned, the same value is also passed to both the {@link pivotX} and
     * {@link pivotY} props.
     *
     * @default 0.5 (center)
     */
    pivot: number;
    /**
     * X position of the Node's Pivot Point
     *
     * @remarks
     * The value can be any number between `0.0` and `1.0`:
     * - `0.0` defines the Pivot Point's X position as the left-most edge of the
     *   Node
     * - `0.5` defines it as the horizontal center of the Node
     * - `1.0` defines it as the right-most edge of the Node.
     *
     * The combination of {@link pivotX} and {@link pivotY} define the Pivot Point
     *
     * @default 0.5 (centered on x-axis)
     */
    pivotX: number;
    /**
     * Y position of the Node's Pivot Point
     *
     * @remarks
     * The value can be any number between `0.0` and `1.0`:
     * - `0.0` defines the Pivot Point's Y position as the top-most edge of the
     *   Node
     * - `0.5` defines it as the vertical center of the Node
     * - `1.0` defines it as the bottom-most edge of the Node.
     *
     * The combination of {@link pivotX} and {@link pivotY} define the Pivot Point
     *
     * @default 0.5 (centered on y-axis)
     */
    pivotY: number;
    /**
     * Rotation of the Node (in Radians)
     *
     * @remarks
     * Sets the amount to rotate the Node by around it's Pivot Point (defined by
     * the {@link pivot} props). Positive values rotate the Node clockwise, while
     * negative values rotate it counter-clockwise.
     *
     * Example values:
     * - `-Math.PI / 2`: 90 degree rotation counter-clockwise
     * - `0`: No rotation
     * - `Math.PI / 2`: 90 degree rotation clockwise
     * - `Math.PI`: 180 degree rotation clockwise
     * - `3 * Math.PI / 2`: 270 degree rotation clockwise
     * - `2 * Math.PI`: 360 rotation clockwise
     */
    rotation: number;
    /**
     * Whether the Node is rendered to a texture
     *
     * @remarks
     * TBD
     *
     * @default false
     */
    rtt: boolean;
    /**
     * Node data element for custom data storage (optional)
     *
     * @remarks
     * This property is used to store custom data on the Node as a key/value data store.
     * Data values are limited to string, numbers, booleans. Strings will be truncated
     * to a 2048 character limit for performance reasons.
     *
     * This is not a data storage mechanism for large amounts of data please use a
     * dedicated data storage mechanism for that.
     *
     * The custom data will be reflected in the inspector as part of `data-*` attributes
     *
     * @default `undefined`
     */
    data?: CustomDataMap;
    /**
     * Image Type to explicitly set the image type that is being loaded
     *
     * @remarks
     * This property must be used with a `src` that points at an image. In some cases
     * the extension doesn't provide a reliable representation of the image type. In such
     * cases set the ImageType explicitly.
     *
     * `regular` is used for normal images such as png, jpg, etc
     * `compressed` is used for ETC1/ETC2 compressed images with a PVR or KTX container
     * `svg` is used for scalable vector graphics
     *
     * @default `undefined`
     */
    imageType?: 'regular' | 'compressed' | 'svg' | null;
    /**
     * She width of the rectangle from which the Image Texture will be extracted.
     * This value can be negative. If not provided, the image's source natural
     * width will be used.
     */
    srcWidth?: number;
    /**
     * The height of the rectangle from which the Image Texture will be extracted.
     * This value can be negative. If not provided, the image's source natural
     * height will be used.
     */
    srcHeight?: number;
    /**
     * The x coordinate of the reference point of the rectangle from which the Texture
     * will be extracted.  `width` and `height` are provided. And only works when
     * createImageBitmap is available. Only works when createImageBitmap is supported on the browser.
     */
    srcX?: number;
    /**
     * The y coordinate of the reference point of the rectangle from which the Texture
     * will be extracted. Only used when source `srcWidth` width and `srcHeight` height
     * are provided. Only works when createImageBitmap is supported on the browser.
     */
    srcY?: number;
    /**
     * Mark the node as interactive so we can perform hit tests on it
     * when pointer events are registered.
     * @default false
     */
    interactive?: boolean;
}
/**
 * Grab all the number properties of type T
 */
type NumberProps<T> = {
    [Key in keyof T as NonNullable<T[Key]> extends number ? Key : never]: number;
};
/**
 * Properties of a Node used by the animate() function
 */
export interface CoreNodeAnimateProps extends NumberProps<CoreNodeProps> {
    /**
     * Shader properties to animate
     */
    shaderProps: Record<string, number>;
}
/**
 * A visual Node in the Renderer scene graph.
 *
 * @remarks
 * CoreNode is an internally used class that represents a Renderer Node in the
 * scene graph. See INode.ts for the public APIs exposed to Renderer users
 * that include generic types for Shaders.
 */
export declare class CoreNode extends EventEmitter {
    readonly stage: Stage;
    readonly children: CoreNode[];
    protected _id: number;
    readonly props: CoreNodeProps;
    readonly isCoreNode: boolean;
    renderOpBufferIdx: number;
    numQuads: number;
    renderOpTextures: WebGlCtxTexture[];
    stencilDepth: number;
    quadBufferIndex: number;
    isQuadDirty: boolean;
    private hasShaderUpdater;
    hasShaderTimeFn: boolean;
    private hasColorProps;
    private zIndexMin;
    private zIndexMax;
    previousZIndex: number;
    updateType: UpdateType;
    childUpdateType: UpdateType;
    globalTransform?: Matrix3d;
    localTransform?: Matrix3d;
    sceneGlobalTransform?: Matrix3d;
    renderCoords?: RenderCoords;
    sceneRenderCoords?: RenderCoords;
    renderBound?: Bound;
    strictBound?: Bound;
    preloadBound?: Bound;
    clippingRect: RectWithValid;
    textureCoords?: TextureCoords;
    updateShaderUniforms: boolean;
    isRenderable: boolean;
    renderState: CoreNodeRenderState;
    /**
     * True when the node has no rotation, no scale, no mount offset, and no
     * contain-resize. The vast majority of nodes in a typical TV UI are
     * "simple" — their local transform is a pure translation.
     */
    isSimple: boolean;
    /**
     * True when localTransform is known to be in identity-shape (ta=1, tb=0,
     * tc=0, td=1) so that subsequent updateLocalTransform calls can skip the
     * 4 redundant field writes and use setTranslate() instead.
     */
    _localIsTranslate: boolean;
    /**
     * True when globalTransform is a pure translation. Read by child nodes in
     * update() to determine if the translate-only global fast path applies.
     */
    _globalIsTranslate: boolean;
    /**
     * Cached result of the contain-resize check, updated in updateIsSimple().
     */
    private _hasContainResize;
    worldAlpha: number;
    premultipliedColorTl: number;
    premultipliedColorTr: number;
    premultipliedColorBl: number;
    premultipliedColorBr: number;
    calcZIndex: number;
    hasRTTupdates: boolean;
    parentHasRenderTexture: boolean;
    rttParent: CoreNode | null;
    /**
     * only used when rtt = true
     */
    framebufferDimensions: Dimensions | null;
    /**Autosize properties */
    autosizer: Autosizer | null;
    parentAutosizer: Autosizer | null;
    destroyed: boolean;
    constructor(stage: Stage, props: CoreNodeProps);
    loadTexture(): void;
    private loadTextureTask;
    unloadTexture(): void;
    protected onTextureLoaded: TextureLoadedEventHandler;
    private onTextureFailed;
    private onTextureFreed;
    protected pendingTextureLoadedDimensions: Dimensions | null;
    protected emitTextureLoadedTask: () => void;
    private pendingTextureFailedError;
    private emitTextureFailedTask;
    private emitTextureFreedTask;
    /**
     * Change types types is used to determine the scope of the changes being applied
     *
     * @remarks
     * See {@link UpdateType} for more information on each type
     *
     * @param type
     */
    setUpdateType(type: UpdateType): void;
    /**
     * Recompute the isSimple flag and the cached contain-resize check.
     *
     * @remarks
     * Called from property setters that affect whether the node is "simple"
     * (rotation, scaleX, scaleY, mountX, mountY, texture, textureOptions).
     * This runs on the cold setter path, not per-frame.
     */
    updateIsSimple(): void;
    updateLocalTransform(): void;
    /**
     * @todo: test for correct calculation flag
     * @param delta
     */
    update(delta: number, parentClippingRect: RectWithValid): void;
    private findParentRTTNode;
    private notifyChildrenRTTOfUpdate;
    protected notifyParentRTTOfUpdate(): void;
    checkRenderBounds(): CoreNodeRenderState;
    updateBoundingRect(): void;
    createRenderBounds(): void;
    updateRenderState(renderState: CoreNodeRenderState): void;
    /**
     * Checks if the node is renderable based on world alpha, dimensions and out of bounds status.
     */
    checkBasicRenderability(): boolean;
    /**
     * Updates the `isRenderable` property based on various conditions.
     */
    updateIsRenderable(): void;
    /**
     * Sets the renderable state and triggers changes if necessary.
     * @param isRenderable - The new renderable state
     */
    setRenderable(isRenderable: boolean): void;
    /**
     * Changes the renderable state of the node.
     */
    updateTextureOwnership(isRenderable: boolean): void;
    /**
     * Checks if the node is out of the viewport bounds.
     */
    isOutOfBounds(): boolean;
    /**
     * Checks if the node has dimensions (width/height)
     */
    hasDimensions(): boolean;
    calculateRenderCoords(): void;
    /**
     * This function calculates the clipping rectangle for a node.
     *
     * The function then checks if the node is rotated. If the node requires clipping and is not rotated, a new clipping rectangle is created based on the node's global transform and dimensions.
     * If a parent clipping rectangle exists, it is intersected with the node's clipping rectangle (if it exists), or replaces the node's clipping rectangle.
     *
     * Finally, the node's parentClippingRect and clippingRect properties are updated.
     */
    calculateClippingRect(parentClippingRect: RectWithValid): void;
    /**
     * Destroy the node and cleanup all resources
     */
    destroy(): void;
    renderQuads(renderer: CoreRenderer): void;
    get quadBufferCollection(): BufferCollection;
    get time(): number;
    getTimerValue(): number;
    sortChildren(): void;
    removeChild(node: CoreNode, targetParent?: CoreNode | null): void;
    addChild(node: CoreNode, previousParent?: CoreNode | null): void;
    get id(): number;
    get data(): CustomDataMap | undefined;
    set data(d: CustomDataMap | undefined);
    get x(): number;
    set x(value: number);
    get absX(): number;
    get absY(): number;
    get y(): number;
    set y(value: number);
    get w(): number;
    set w(value: number);
    get h(): number;
    set h(value: number);
    get scale(): number;
    set scale(value: number);
    get scaleX(): number;
    set scaleX(value: number);
    get scaleY(): number;
    set scaleY(value: number);
    get mount(): number;
    set mount(value: number);
    get mountX(): number;
    set mountX(value: number);
    get mountY(): number;
    set mountY(value: number);
    get pivot(): number;
    set pivot(value: number);
    get pivotX(): number;
    set pivotX(value: number);
    get pivotY(): number;
    set pivotY(value: number);
    get rotation(): number;
    set rotation(value: number);
    get alpha(): number;
    set alpha(value: number);
    get autosize(): boolean;
    set autosize(value: boolean);
    get boundsMargin(): number | [number, number, number, number] | null;
    set boundsMargin(value: number | [number, number, number, number] | null);
    get clipping(): boolean;
    set clipping(value: boolean);
    get clipRadius(): number;
    set clipRadius(value: number);
    get color(): number;
    set color(value: number);
    get colorTop(): number;
    set colorTop(value: number);
    get colorBottom(): number;
    set colorBottom(value: number);
    get colorLeft(): number;
    set colorLeft(value: number);
    get colorRight(): number;
    set colorRight(value: number);
    get colorTl(): number;
    set colorTl(value: number);
    get colorTr(): number;
    set colorTr(value: number);
    get colorBl(): number;
    set colorBl(value: number);
    get colorBr(): number;
    set colorBr(value: number);
    get zIndex(): number;
    set zIndex(value: number);
    get parent(): CoreNode | null;
    set parent(newParent: CoreNode | null);
    get rtt(): boolean;
    set rtt(value: boolean);
    private initRenderTexture;
    private cleanupRenderTexture;
    private markChildrenWithRTT;
    private applyRTTInheritance;
    private clearRTTInheritance;
    get shader(): CoreShaderNode<any> | null;
    set shader(shader: CoreShaderNode<any> | null);
    get src(): string | null;
    set src(imageUrl: string | null);
    set imageType(type: 'regular' | 'compressed' | 'svg' | null);
    get imageType(): "regular" | "compressed" | "svg" | null;
    get srcHeight(): number | undefined;
    set srcHeight(value: number);
    get srcWidth(): number | undefined;
    set srcWidth(value: number);
    get srcX(): number | undefined;
    set srcX(value: number);
    get srcY(): number | undefined;
    set srcY(value: number);
    /**
     * Returns the framebuffer dimensions of the RTT parent
     */
    get parentFramebufferDimensions(): Dimensions | null;
    /**
     * Returns the parent render texture node if it exists.
     */
    get parentRenderTexture(): CoreNode | null;
    get texture(): Texture | null;
    set texture(value: Texture | null);
    set textureOptions(value: TextureOptions);
    get textureOptions(): TextureOptions;
    set interactive(value: boolean | undefined);
    get interactive(): boolean | undefined;
    setRTTUpdates(type: number): void;
    animate(props: Partial<CoreNodeAnimateProps>, settings: Partial<AnimationSettings>): IAnimationController;
    flush(): void;
    /**
     * Add a texture to the current RenderOp.
     *
     * @param texture
     * @returns Assigned Texture Index of the texture in the render op
     */
    addTexture(texture: WebGlCtxTexture): number;
    draw(renderer: WebGlRenderer): void;
}
export {};
