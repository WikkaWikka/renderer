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
import { EventEmitter } from '../common/EventEmitter.js';
import { assertTruthy, isProductionEnvironment } from '../utils.js';
import { Stage } from '../core/Stage.js';
import { CoreNode } from '../core/CoreNode.js';
import {} from '../core/CoreTextNode.js';
import { WebPlatform } from '../core/platforms/web/WebPlatform.js';
import { Platform } from '../core/platforms/Platform.js';
/**
 * The Renderer Main API
 *
 * @remarks
 * This is the primary class used to configure and operate the Renderer.
 *
 * It is used to create and destroy Nodes, as well as Texture and Shader
 * references.
 *
 * Example:
 * ```ts
 * import { RendererMain, MainCoreDriver } from '@lightningjs/renderer';
 *
 * // Initialize the Renderer
 * const renderer = new RendererMain(
 *   {
 *     appWidth: 1920,
 *     appHeight: 1080
 *   },
 *   'app',
 *   new MainCoreDriver(),
 * );
 * ```
 *
 * ## Event Handling
 *
 * Listen to events using the standard EventEmitter API:
 * ```typescript
 * renderer.on('fpsUpdate', (data: RendererMainFpsUpdateEvent) => {
 *   console.log(`FPS: ${data.fps}`);
 * });
 *
 * renderer.on('idle', (data: RendererMainIdleEvent) => {
 *   // Renderer is idle - no scene changes
 * });
 * ```
 *
 * @see {@link RendererMainFpsUpdateEvent}
 * @see {@link RendererMainFrameTickEvent}
 * @see {@link RendererMainQuadsUpdateEvent}
 * @see {@link RendererMainIdleEvent}
 * @see {@link RendererMainCriticalCleanupEvent}
 * @see {@link RendererMainCriticalCleanupFailedEvent}
 *
 * @fires RendererMain#fpsUpdate
 * @fires RendererMain#frameTick
 * @fires RendererMain#quadsUpdate
 * @fires RendererMain#idle
 * @fires RendererMain#criticalCleanup
 * @fires RendererMain#criticalCleanupFailed
 * @fires RendererMain#contextLost
 * @fires RendererMain#contextRestored
 * @fires RendererMain#contextRestoreFailed
 */
export class RendererMain extends EventEmitter {
    root;
    canvas;
    stage;
    inspector = null;
    /**
     * Constructs a new Renderer instance
     *
     * @param settings Renderer settings
     * @param target Element ID or HTMLElement to insert the canvas into
     * @param driver Core Driver to use
     */
    constructor(settings, target) {
        super();
        const resolvedTxSettings = this.resolveTxSettings(settings.textureMemory || {});
        settings = {
            appWidth: settings.appWidth || 1920,
            appHeight: settings.appHeight || 1080,
            textureMemory: resolvedTxSettings,
            boundsMargin: settings.boundsMargin || 0,
            deviceLogicalPixelRatio: settings.deviceLogicalPixelRatio || 1,
            devicePhysicalPixelRatio: settings.devicePhysicalPixelRatio || this.windowDevicePixelRatio() || 1,
            clearColor: settings.clearColor ?? 0x00000000,
            fpsUpdateInterval: settings.fpsUpdateInterval || 0,
            fpsBoundaries: settings.fpsBoundaries,
            enableClear: settings.enableClear ?? true,
            targetFPS: settings.targetFPS || 0,
            numImageWorkers: settings.numImageWorkers !== undefined ? settings.numImageWorkers : 2,
            enableContextSpy: settings.enableContextSpy ?? false,
            forceWebGL2: settings.forceWebGL2 ?? false,
            inspector: settings.inspector ?? false,
            inspectorOptions: settings.inspectorOptions ?? {},
            renderEngine: settings.renderEngine,
            halti: settings.halti ?? null,
            quadBufferSize: settings.quadBufferSize ?? 4 * 1024 * 1024,
            enableDirtyRepaints: settings.enableDirtyRepaints ?? true,
            contextRestoreTimeout: settings.contextRestoreTimeout ?? 10000,
            fontEngines: settings.fontEngines ?? [],
            textureProcessingTimeLimit: settings.textureProcessingTimeLimit || 42,
            maxTextureUploadsDuringAnimation: settings.maxTextureUploadsDuringAnimation ?? 1,
            canvas: settings.canvas,
            createImageBitmapSupport: settings.createImageBitmapSupport || 'full',
            platform: settings.platform || WebPlatform,
            maxRetryCount: settings.maxRetryCount ?? 5,
            handleLoopError: settings.handleLoopError,
            autoStart: settings.autoStart ?? true,
        };
        const { appWidth, appHeight, deviceLogicalPixelRatio, devicePhysicalPixelRatio, inspector, } = settings;
        assertTruthy(settings.platform, 'A platform implementation must be provided in settings.platform');
        const platform = new settings.platform(settings);
        const deviceLogicalWidth = appWidth * deviceLogicalPixelRatio;
        const deviceLogicalHeight = appHeight * deviceLogicalPixelRatio;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.canvas = platform.canvas;
        this.canvas.width = deviceLogicalWidth * devicePhysicalPixelRatio;
        this.canvas.height = deviceLogicalHeight * devicePhysicalPixelRatio;
        this.canvas.style.width = `${deviceLogicalWidth}px`;
        this.canvas.style.height = `${deviceLogicalHeight}px`;
        // Initialize the stage
        this.stage = new Stage({
            appWidth,
            appHeight,
            boundsMargin: settings.boundsMargin,
            clearColor: settings.clearColor,
            deviceLogicalPixelRatio,
            devicePhysicalPixelRatio,
            enableContextSpy: settings.enableContextSpy,
            fpsUpdateInterval: settings.fpsUpdateInterval,
            fpsBoundaries: settings.fpsBoundaries,
            enableClear: settings.enableClear,
            renderEngine: settings.renderEngine,
            halti: settings.halti,
            textureMemory: resolvedTxSettings,
            eventBus: this,
            quadBufferSize: settings.quadBufferSize,
            enableDirtyRepaints: settings.enableDirtyRepaints,
            contextRestoreTimeout: settings.contextRestoreTimeout,
            fontEngines: settings.fontEngines,
            inspector: inspector !== false,
            targetFPS: settings.targetFPS,
            textureProcessingTimeLimit: settings.textureProcessingTimeLimit,
            maxTextureUploadsDuringAnimation: settings.maxTextureUploadsDuringAnimation,
            createImageBitmapSupport: settings.createImageBitmapSupport,
            platform,
            maxRetryCount: settings.maxRetryCount ?? 5,
            autoStart: settings.autoStart,
        });
        // Extract the root node
        this.root = this.stage.root;
        // Get the target element and attach the canvas to it
        if (target) {
            let targetEl;
            if (typeof target === 'string') {
                targetEl = document.getElementById(target);
            }
            else {
                targetEl = target;
            }
            if (!targetEl) {
                throw new Error('Could not find target element');
            }
            targetEl.appendChild(this.canvas);
        }
        else if (settings.canvas !== this.canvas) {
            throw new Error('New canvas element could not be appended to undefined target');
        }
        // Initialize inspector (if enabled)
        if (inspector && isProductionEnvironment === false) {
            this.inspector = new inspector(this.canvas, settings);
        }
    }
    /**
     * Resolves the Texture Memory Manager values
     *
     * @param props
     * @returns
     */
    resolveTxSettings(textureMemory, currentTxSettings = {}) {
        return {
            criticalThreshold: textureMemory.criticalThreshold ??
                currentTxSettings.criticalThreshold ??
                124e6,
            targetThresholdLevel: textureMemory.targetThresholdLevel ??
                currentTxSettings.targetThresholdLevel ??
                0.5,
            cleanupInterval: textureMemory.cleanupInterval ??
                currentTxSettings.cleanupInterval ??
                5000,
            debugLogging: textureMemory.debugLogging ?? currentTxSettings.debugLogging ?? false,
            baselineMemoryAllocation: textureMemory.baselineMemoryAllocation ??
                currentTxSettings.baselineMemoryAllocation ??
                26e6,
            doNotExceedCriticalThreshold: textureMemory.doNotExceedCriticalThreshold ??
                currentTxSettings.doNotExceedCriticalThreshold ??
                false,
        };
    }
    /**
     * Create a new scene graph node
     *
     * @remarks
     * A node is the main graphical building block of the Renderer scene graph. It
     * can be a container for other nodes, or it can be a leaf node that renders a
     * solid color, gradient, image, or specific texture, using a specific shader.
     *
     * To create a text node, see {@link createTextNode}.
     *
     * See {@link CoreNode} for more details.
     *
     * @param props
     * @returns
     */
    createNode(props) {
        const node = this.stage.createNode(props);
        if (this.inspector) {
            return this.inspector.createNode(node);
        }
        return node;
    }
    /**
     * Create a new scene graph text node
     *
     * @remarks
     * A text node is the second graphical building block of the Renderer scene
     * graph. It renders text using a specific text renderer that is automatically
     * chosen based on the font requested and what type of fonts are installed
     * into an app.
     *
     * See {@link ITextNode} for more details.
     *
     * @param props
     * @returns
     */
    createTextNode(props) {
        const textNode = this.stage.createTextNode(props);
        if (this.inspector) {
            return this.inspector.createTextNode(textNode);
        }
        return textNode;
    }
    /**
     * Destroy a node
     *
     * @remarks
     * This method destroys a node
     *
     * @param node
     * @returns
     */
    destroyNode(node) {
        if (this.inspector) {
            this.inspector.destroyNode(node.id);
        }
        return node.destroy();
    }
    /**
     * Create a new texture reference
     *
     * @remarks
     * This method creates a new reference to a texture. The texture is not
     * loaded until it is used on a node.
     *
     * It can be assigned to a node's `texture` property, or it can be used
     * when creating a SubTexture.
     *
     * @param textureType
     * @param props
     * @param options
     * @returns
     */
    createTexture(textureType, props) {
        return this.stage.txManager.createTexture(textureType, props);
    }
    /**
     * Create a new shader controller for a shader type
     *
     * @remarks
     * This method creates a new Shader Controller for a specific shader type.
     *
     * If the shader has not been loaded yet, it will be loaded. Otherwise, the
     * existing shader will be reused.
     *
     * It can be assigned to a Node's `shader` property.
     *
     * @param shaderType
     * @param props
     * @returns
     */
    createShader(shType, props) {
        return this.stage.shManager.createShader(shType, props);
    }
    /**
     * Remove a shader type and destroy its compiled programs.
     *
     * @remarks
     * Enables dynamic runtime shaders and hot-reload: after unregistering,
     * the same name can be registered again with new GLSL source via
     * `stage.shManager.registerShaderType` and re-created via `createShader`.
     * Existing shader nodes are not auto-migrated — re-create them and
     * reassign `node.shader`.
     */
    unregisterShaderType(name) {
        this.stage.shManager.unregisterShaderType(name);
    }
    /**
     * Replace a shader type definition at runtime.
     *
     * @remarks
     * Equivalent to `unregisterShaderType` + `registerShaderType`. The next
     * `createShader` call compiles the new source.
     */
    updateShaderType(name, shType) {
        this.stage.shManager.updateShaderType(name, shType);
    }
    /**
     * Get a Node by its ID
     *
     * @param id
     * @returns
     */
    getNodeById(id) {
        const root = this.stage.root;
        const findNode = (node) => {
            if (node.id === id) {
                return node;
            }
            for (const child of node.children) {
                const found = findNode(child);
                if (found) {
                    return found;
                }
            }
            return null;
        };
        return findNode(root);
    }
    toggleFreeze() {
        throw new Error('Not implemented');
    }
    advanceFrame() {
        throw new Error('Not implemented');
    }
    getBufferInfo() {
        return this.stage.renderer.getBufferInfo();
    }
    /**
     * Re-render the current frame without advancing any running animations.
     *
     * @remarks
     * Any state changes will be reflected in the re-rendered frame. Useful for
     * debugging.
     *
     * May not do anything if the render loop is running on a separate worker.
     */
    rerender() {
        this.stage.requestRender();
    }
    /**
     * Cleanup textures that are not being used
     *
     * @param aggressive - If true, will cleanup all textures, regardless of render status
     *
     * @remarks
     * This can be used to free up GFX memory used by textures that are no longer
     * being displayed.
     *
     * This routine is also called automatically when the memory used by textures
     * exceeds the critical threshold on frame generation **OR** when the renderer
     * is idle and the memory used by textures exceeds the target threshold.
     *
     * **NOTE**: This is a heavy operation and should be used sparingly.
     * **NOTE2**: This will not cleanup textures that are currently being displayed.
     * **NOTE3**: This will not cleanup textures that are marked as `preventCleanup`.
     * **NOTE4**: This has nothing to do with the garbage collection of JavaScript.
     */
    cleanup() {
        this.stage.cleanup();
    }
    /**
     * Sets the clear color for the stage.
     *
     * @param color - The color to set as the clear color.
     */
    setClearColor(color) {
        this.stage.setClearColor(color);
    }
    /**
     * Set options for the renderer
     *
     * @param options
     */
    setOptions(options) {
        const stage = this.stage;
        if (options.textureMemory !== undefined) {
            const textureMemory = (options.textureMemory = this.resolveTxSettings(options.textureMemory, stage.options.textureMemory));
            stage.txMemManager.updateSettings(textureMemory);
            stage.txMemManager.cleanup();
        }
        if (options.boundsMargin !== undefined) {
            let bm = options.boundsMargin;
            options.boundsMargin = Array.isArray(bm) ? bm : [bm, bm, bm, bm];
        }
        const stageOptions = stage.options;
        for (let key in options) {
            stageOptions[key] = options[key];
        }
        if (options.inspector !== undefined && !isProductionEnvironment) {
            if (options.inspector === false) {
                this.inspector?.destroy();
                this.inspector = null;
            }
            else if (this.inspector === null ||
                this.inspector.constructor !== options.inspector) {
                this.inspector = new options.inspector(this.canvas, stage.options);
                this.inspector.createNodes(this.root);
            }
        }
        let needDimensionsUpdate = false;
        if (options.deviceLogicalPixelRatio ||
            options.devicePhysicalPixelRatio !== undefined) {
            this.stage.pixelRatio =
                stageOptions.devicePhysicalPixelRatio *
                    stageOptions.deviceLogicalPixelRatio;
            this.inspector?.updateViewport(stageOptions.appWidth, stageOptions.appHeight, stageOptions.deviceLogicalPixelRatio);
            needDimensionsUpdate = true;
        }
        if (options.appWidth !== undefined || options.appHeight !== undefined) {
            this.inspector?.updateViewport(stageOptions.appWidth, stageOptions.appHeight, stageOptions.deviceLogicalPixelRatio);
            needDimensionsUpdate = true;
        }
        if (options.fpsUpdateInterval !== undefined) {
            stage.updateFpsUpdateInterval(options.fpsUpdateInterval);
        }
        if (options.fpsBoundaries !== undefined) {
            stage.updateFpsBoundaries(options.fpsBoundaries);
        }
        if (options.boundsMargin !== undefined) {
            stage.setBoundsMargin(options.boundsMargin);
        }
        if (options.clearColor !== undefined) {
            stage.setClearColor(options.clearColor);
        }
        if (needDimensionsUpdate) {
            this.updateAppDimensions();
        }
    }
    updateAppDimensions() {
        const { appWidth, appHeight, deviceLogicalPixelRatio, devicePhysicalPixelRatio, } = this.stage.options;
        const deviceLogicalWidth = appWidth * deviceLogicalPixelRatio;
        const deviceLogicalHeight = appHeight * deviceLogicalPixelRatio;
        this.canvas.width = deviceLogicalWidth * devicePhysicalPixelRatio;
        this.canvas.height = deviceLogicalHeight * devicePhysicalPixelRatio;
        this.canvas.style.width = `${deviceLogicalWidth}px`;
        this.canvas.style.height = `${deviceLogicalHeight}px`;
        this.stage.renderer.updateViewport();
        this.root.w = appWidth;
        this.root.h = appHeight;
        this.stage.updateViewportBounds();
    }
    get settings() {
        return this.stage.options;
    }
    /**
     * Resolves after the renderer's first frame has been drawn.
     *
     * @remarks
     * See {@link Stage.ready}. Useful to defer heavy scene building until the
     * renderer is actually capable of presenting frames.
     *
     * @example
     * ```typescript
     * const renderer = new RendererMain({ ... }, 'app');
     * await renderer.ready;
     * // build scene, load fonts, ...
     * ```
     */
    get ready() {
        return this.stage.ready;
    }
    /**
     * Gets the target FPS for the global render loop
     *
     * @returns The current target FPS (0 means no throttling)
     *
     * @remarks
     * This controls the maximum frame rate of the entire rendering system.
     * When 0, the system runs at display refresh rate.
     */
    get targetFPS() {
        return this.stage.options.targetFPS || 0;
    }
    /**
     * Sets the target FPS for the global render loop
     *
     * @param fps - The target FPS to set for the global render loop.
     *              Set to 0 or a negative value to disable throttling.
     *
     * @remarks
     * This setting affects the entire rendering system immediately.
     * All animations, rendering, and frame updates will be throttled
     * to this target FPS. Provides global performance control.
     *
     * @example
     * ```typescript
     * // Set global target to 30fps for better performance
     * renderer.targetFPS = 30;
     *
     * // Disable global throttling (use display refresh rate)
     * renderer.targetFPS = 0;
     * ```
     */
    set targetFPS(fps) {
        this.stage.options.targetFPS = fps > 0 ? fps : 0;
        this.stage.updateTargetFrameTime();
    }
    windowDevicePixelRatio() {
        return typeof window !== 'undefined' ? window.devicePixelRatio : undefined;
    }
    /**
     * Register an active animation with the renderer.
     *
     * @remarks
     * This increments a global animation counter shared by both the internal
     * animation engine and external animation libraries. While the counter is
     * above zero, the renderer throttles texture uploads (configurable via the
     * {@link RendererMainSettings.maxTextureUploadsDuringAnimation} setting,
     * which defaults to one per frame) to preserve the frame budget.
     *
     * Call {@link unregisterAnimation} when the animation completes, is
     * cancelled, or is otherwise no longer driving per-frame updates.
     *
     * The renderer's own {@link INode.animate} method handles this
     * automatically. This API is intended for external animation libraries
     * such as AnimeJS, GSAP, or custom tween loops.
     *
     * @example
     * ```typescript
     * // AnimeJS integration
     * import anime from 'animejs';
     *
     * anime({
     *   targets: myProps,
     *   x: 500,
     *   duration: 1000,
     *   begin: () => renderer.registerAnimation(),
     *   complete: () => renderer.unregisterAnimation(),
     *   update: () => { node.x = myProps.x; },
     * });
     *
     * // For AnimeJS timelines, use timeline-level hooks:
     * const tl = anime.timeline({
     *   begin: () => renderer.registerAnimation(),
     *   complete: () => renderer.unregisterAnimation(),
     * });
     * tl.add({ targets: node, x: 100, duration: 500 });
     * tl.add({ targets: node, y: 200, duration: 500 });
     * ```
     */
    registerAnimation() {
        this.stage.activeAnimationCount++;
    }
    /**
     * Unregister a previously registered animation.
     *
     * @remarks
     * Decrements the global animation counter. When the counter reaches zero,
     * the renderer resumes full-budget texture processing (only limited by the
     * {@link RendererMainSettings.textureProcessingTimeLimit}).
     *
     * Must be called exactly once for each corresponding
     * {@link registerAnimation} call.
     */
    unregisterAnimation() {
        if (this.stage.activeAnimationCount > 0) {
            this.stage.activeAnimationCount--;
        }
    }
    /**
     * Close and destroy the renderer, releasing all resources.
     *
     * @remarks
     * This method performs a full teardown of the renderer:
     * - Stops the platform render loop
     * - Destroys all scene nodes (including text node font resources)
     * - Releases all texture memory and GPU resources
     * - Terminates image worker threads
     * - Removes the canvas element from the target div
     * - Destroys the inspector if active
     */
    close() {
        // Destroy the inspector first
        this.inspector?.destroy();
        this.inspector = null;
        // Destroy the stage (stops loop, destroys nodes, releases textures/GPU)
        this.stage.destroy();
        // Remove the canvas from the DOM
        this.canvas.remove();
    }
}
//# sourceMappingURL=Renderer.js.map