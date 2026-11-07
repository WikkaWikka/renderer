import { AnimationManager } from './animations/AnimationManager.js';
import { CoreNode, type CoreNodeProps } from './CoreNode.js';
import { CoreTextureManager } from './CoreTextureManager.js';
import { CoreShaderManager } from './CoreShaderManager.js';
import type { FontHandler, FontLoadOptions, TextRenderer, TextRenderers, TrProps } from './text-rendering/TextRenderer.js';
import { EventEmitter } from '../common/EventEmitter.js';
import { ContextSpy } from './lib/ContextSpy.js';
import type { FpsUpdatePayload, FrameTickPayload, QuadsUpdatePayload } from '../common/CommonTypes.js';
import { TextureMemoryManager, type TextureMemoryManagerSettings } from './TextureMemoryManager.js';
import type { CoreRenderer } from './renderers/CoreRenderer.js';
import { CoreTextNode, type CoreTextNodeProps } from './CoreTextNode.js';
import type { CoreShaderNode } from './renderers/CoreShaderNode.js';
import { type Bound } from './lib/utils.js';
import type { Texture } from './textures/Texture.js';
import type { Platform, PlatformSettings } from './platforms/Platform.js';
import type { WebPlatform } from './platforms/web/WebPlatform.js';
import type { RendererMainSettings } from '../main-api/Renderer.js';
import { type FrameCounter } from './lib/fps.js';
export type StageOptions = Omit<RendererMainSettings, 'inspector' | 'platform' | 'maxRetryCount' | keyof PlatformSettings> & {
    textureMemory: TextureMemoryManagerSettings;
    fpsUpdateInterval: number;
    fpsBoundaries?: number[];
    eventBus: EventEmitter;
    platform: Platform | WebPlatform;
    inspector: boolean;
    maxRetryCount: number;
    enableClear: boolean;
};
export type StageFpsUpdateHandler = (stage: Stage, fpsData: FpsUpdatePayload) => void;
export type StageFrameTickHandler = (stage: Stage, frameTickData: FrameTickPayload) => void;
export interface Point {
    x: number;
    y: number;
}
export declare class Stage {
    options: StageOptions;
    /**
     * Resolves after the first frame has been drawn.
     *
     * @remarks
     * Lets apps distinguish "constructed" from "first frame capable" without
     * guessing: `await renderer.ready` before building heavy scenes, or show
     * loading UI until it resolves. Also resolved by `destroy()` so it never
     * dangles if the loop never draws.
     */
    readonly ready: Promise<void>;
    private resolveReady;
    private firstFrameDrawn;
    contextState: 'running' | 'lost' | 'restoring' | 'failed' | 'destroyed';
    private contextSuspended;
    private contextGeneration;
    private contextLostAt;
    private pendingRestoreEvent;
    private restoreTimeoutHandle;
    private clearRestoreTimeout;
    onContextLost(): void;
    onContextRestored(): boolean;
    onRecoveryFrameFailed(error: unknown): boolean;
    onRecoveryFrameCompleted(): void;
    readonly animationManager: AnimationManager;
    readonly txManager: CoreTextureManager;
    readonly txMemManager: TextureMemoryManager;
    readonly textRenderers: Record<string, TextRenderer>;
    readonly fontHandlers: Record<string, FontHandler>;
    readonly shManager: CoreShaderManager;
    readonly renderer: CoreRenderer;
    readonly root: CoreNode;
    readonly interactiveNodes: Set<CoreNode>;
    boundsMargin: [number, number, number, number];
    readonly defShaderNode: CoreShaderNode | null;
    strictBound: Bound;
    preloadBound: Bound;
    readonly defaultTexture: Texture | null;
    pixelRatio: number;
    /**
     * Global count of active animations (internal + external).
     *
     * @remarks
     * Incremented by AnimationManager when an internal animation starts,
     * decremented when it stops. External animation libraries (e.g. AnimeJS,
     * GSAP) increment/decrement this counter via
     * {@link RendererMain.registerAnimation} / {@link RendererMain.unregisterAnimation}.
     *
     * Used by the render loop to throttle texture uploads during animations:
     * while > 0, at most `maxTextureUploadsDuringAnimation` textures are
     * uploaded per frame to preserve the frame budget. When zero, the full
     * time budget is used.
     */
    activeAnimationCount: number;
    private readonly frameTickPayload;
    readonly bufferMemory: number;
    readonly platform: Platform | WebPlatform;
    readonly calculateTextureCoord: boolean;
    quadsPayload: QuadsUpdatePayload;
    /**
     * Target frame time in milliseconds (calculated from targetFPS)
     *
     * @remarks
     * This is pre-calculated to avoid recalculating on every frame.
     * - 0 means no throttling (use display refresh rate)
     * - >0 means throttle to this frame time (1000 / targetFPS)
     */
    targetFrameTime: number;
    /**
     * Renderer Event Bus for the Stage to emit events onto
     *
     * @remarks
     * In reality this is just the RendererMain instance, which is an EventEmitter.
     * this allows us to directly emit events from the Stage to RendererMain
     * without having to set up forwarding handlers.
     */
    readonly eventBus: EventEmitter;
    startTime: number;
    deltaTime: number;
    lastFrameTime: number;
    currentFrameTime: number;
    elapsedTime: number;
    currentFrameCounter: FrameCounter | null;
    private timedNodes;
    private clrColor;
    private numQuadsRendered;
    private renderRequested;
    private frameEventQueue;
    renderListNodes: CoreNode[];
    private renderListOps;
    renderListLen: number;
    private renderListDirty;
    private hasOnlyOneFontEngine;
    private hasOnlyCanvasFontEngine;
    private hasCanvasEngine;
    private initializedTextEngines;
    private singleFontEngine;
    private singleFontHandler;
    contextSpy: ContextSpy | null;
    /**
     * Stage constructor
     */
    constructor(options: StageOptions);
    setClearColor(color: number): void;
    /**
     * Update the target frame time based on the current targetFPS setting
     *
     * @remarks
     * This should be called whenever the targetFPS option is changed
     * to ensure targetFrameTime stays in sync.
     * targetFPS of 0 means no throttling (targetFrameTime = 0)
     * targetFPS > 0 means throttle to 1000/targetFPS milliseconds
     */
    updateTargetFrameTime(): void;
    updateFrameTime(): void;
    /**
     * Create default PixelTexture
     */
    createDefaultTexture(): void;
    /**
     * Update animations
     */
    updateAnimations(): void;
    /**
     * Check if the scene has updates
     */
    hasSceneUpdates(): boolean;
    /**
     * Start a new frame draw
     */
    drawFrame(): void;
    /**
     * Queue an event to be emitted after the current/next frame is rendered
     *
     * @remarks
     * When we are operating in the context of the render loop, we may want to
     * emit events that are related to the current frame. However, we generally do
     * NOT want to emit events directly in the middle of the render loop, since
     * this could enable event handlers to modify the scene graph and cause
     * unexpected behavior. Instead, we queue up events to be emitted and then
     * flush the queue after the frame has been rendered.
     *
     * @param name
     * @param data
     */
    queueFrameEvent(name: string, data: unknown): void;
    /**
     * Emit all queued frame events
     *
     * @remarks
     * This method should be called after the frame has been rendered to emit
     * all events that were queued during the frame.
     *
     * App-facing (`fpsUpdate`, `quadsUpdate`, `criticalCleanup*`): each event
     * is fanned out via `emitSafe`, so one bad listener neither blocks the
     * remaining listeners nor the remaining queued events, and never kills rAF.
     *
     * See {@link queueFrameEvent} for more information.
     */
    flushFrameEvents(): void;
    calculateFps(): void;
    updateFpsUpdateInterval(newInterval: number): void;
    updateFpsBoundaries(newBoundaries: number[]): void;
    calculateQuads(): void;
    /**
     * Mark the render list as dirty, triggering a rebuild on the next frame.
     *
     * @remarks
     * Called by CoreNode when the scene structure changes (child add/remove,
     * visibility toggle, z-index re-sort). Deduplicated: if the list is
     * already dirty, this is a no-op.
     */
    requestRenderListUpdate(): void;
    /**
     * Append a render operation to the cached render list.
     *
     * @param node - The node associated with this operation
     * @param op - 0 = renderQuads, 1 = beginRoundedClip, 2 = endRoundedClip
     */
    private pushRenderOp;
    /**
     * Build a flat render list by walking the scene tree in pre-order.
     *
     * @remarks
     * Functionally identical to the previous recursive `addQuads` method but
     * additionally caches the traversal result (nodes + stencil clip ops) so
     * that clean frames can replay the list linearly without recursion.
     *
     * On rebuild frames, `renderQuads` is called inline (same as before) so
     * the renderer's `renderOps` array is populated during the walk.
     *
     * @param node - Current node being visited
     * @param cache - Whether to record the traversal into the cached render
     * list. When false, quads/stencil ops are fed to the renderer immediately
     * without caching (used by the RTT path).
     */
    private buildRenderList;
    /**
     * Walk a node's subtree and feed quads + stencil clip ops to the active
     * renderer without touching the cached render list.
     *
     * @remarks
     * Used by the render-to-texture path, which draws each RTT subtree to its
     * own framebuffer immediately and then flushes the renderer's operation
     * queue.
     *
     * @param node - Root of the subtree to render
     */
    addSubtreeQuads(node: CoreNode): void;
    /**
     * Request a render pass without forcing an update
     */
    requestRender(): void;
    /**
     * Initialize a text engine on first use.
     *
     * @remarks
     * Engines are registered (not initialized) in the constructor so unused
     * engines — e.g. the Canvas fallback in an MSDF-only app — never pay for
     * canvas allocation and context setup. Initialization is idempotent per
     * engine type.
     */
    ensureTextEngineInitialized(type: string): void;
    /**
     * Given a font name, and possible renderer override, return the best compatible text renderer.
     *
     * @remarks
     * Will try to return a canvas renderer if no other suitable renderer can be resolved.
     *
     * As a side effect the returned engine is initialized (see
     * {@link ensureTextEngineInitialized}) and a load of the requested font
     * family is kicked off when the handler supports it, so the first text
     * node warms everything its first frame needs.
     *
     * @param fontFamily
     * @param textRendererOverride
     * @returns
     */
    resolveTextRenderer(trProps: TrProps, textRendererOverride?: keyof TextRenderers | null): TextRenderer | null;
    createNode(props: Partial<CoreNodeProps>): CoreNode;
    createTextNode(props: Partial<CoreTextNodeProps>): CoreTextNode;
    setBoundsMargin(value: number | [number, number, number, number]): void;
    /**
     * Update the viewport bounds
     */
    updateViewportBounds(): void;
    /** Find all nodes at a given point
     * @param data
     */
    findNodesAtPoint(data: Point): CoreNode[];
    /**
     * Find the top node at a given point
     * @param data
     * @returns
     */
    getNodeFromPosition(data: Point): CoreNode | null;
    /**
     * add node to timeNodes arrays
     * @param node
     * @returns
     */
    trackTimedNode(node: CoreNode): void;
    /**
     * remove node from timeNodes arrays
     * @param node
     * @returns
     */
    untrackTimedNode(node: CoreNode): void;
    /**
     * Resolves the default property values for a Node
     *
     * @remarks
     * This method is used internally by the RendererMain to resolve the default
     * property values for a Node. It is exposed publicly so that it can be used
     * by Core Driver implementations.
     *
     * @param props
     * @returns
     */
    protected resolveNodeDefaults(props: Partial<CoreNodeProps>): CoreNodeProps;
    /**
     * Cleanup Orphaned Textures
     *
     * @remarks
     * This method is used to cleanup orphaned textures that are no longer in use.
     */
    cleanup(full?: boolean): void;
    /**
     * Destroy the stage and release all resources.
     *
     * @remarks
     * This method stops the render loop, destroys all nodes, releases all
     * textures and GPU resources, and terminates any background workers.
     */
    destroy(): void;
    set clearColor(value: number);
    get clearColor(): number;
    /**
     * Register a font using a specific text renderer type
     *
     * @remarks
     * This method allows consumers to explicitly register fonts for a specific
     * text renderer type (e.g., 'canvas', 'sdf'). Consumers must specify
     * the renderer type to ensure fonts are loaded with the correct pipeline.
     *
     * Registration only stores where to find the font — no fetch, decode, or
     * GPU upload happens here. Loading starts automatically on first use of
     * the font family (or via {@link preloadFont} for eager loading), so
     * registered fonts that are never rendered cost nothing.
     *
     * For Canvas fonts, provide fontUrl (e.g., .ttf, .woff, .woff2)
     * For SDF fonts, provide atlasUrl (image) and atlasDataUrl (JSON glyph data)
     *
     * @param rendererType - The type of text renderer ('canvas', 'sdf', etc.)
     * @param options - Font loading options specific to the renderer type
     * @returns Promise that resolves when the font is registered
     */
    loadFont(rendererType: TextRenderers, options: FontLoadOptions): Promise<void>;
    /**
     * Eagerly load a font, resolving only after it is renderable.
     *
     * @remarks
     * Unlike {@link loadFont} (register-only), this fetches, decodes, and
     * uploads the font immediately. Use when first-paint readiness of a font
     * must be guaranteed (e.g. awaited before drawing).
     *
     * @param rendererType - The type of text renderer ('canvas', 'sdf', etc.)
     * @param options - Font loading options specific to the renderer type
     * @returns Promise that resolves when the font is loaded
     */
    preloadFont(rendererType: TextRenderers, options: FontLoadOptions): Promise<void>;
}
