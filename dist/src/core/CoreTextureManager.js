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
import { ColorTexture } from './textures/ColorTexture.js';
import { ImageTexture } from './textures/ImageTexture.js';
import { CanvasTextTexture } from './textures/CanvasTextTexture.js';
import { NoiseTexture } from './textures/NoiseTexture.js';
import { SubTexture } from './textures/SubTexture.js';
import { RenderTexture } from './textures/RenderTexture.js';
import { Texture, TextureType, isTextureDataPromise, } from './textures/Texture.js';
import { EventEmitter } from '../common/EventEmitter.js';
import { TextureError, TextureErrorCode } from './TextureError.js';
import { createTextureUploadQueue } from './lib/TextureUploadQueue.js';
export class CoreTextureManager extends EventEmitter {
    /**
     * Map of textures by cache key
     */
    keyCache = new Map();
    /**
     * Map of texture constructors by their type name
     */
    txConstructors = {};
    maxRetryCount;
    uploadTextureQueue = createTextureUploadQueue();
    contextTextures = new Set();
    restoreTextures = new Set();
    pendingContextLoads = new Set();
    contextGeneration = 0;
    stage;
    platform;
    /**
     * Renderer that this texture manager is associated with
     *
     * @remarks
     * This MUST be set before the texture manager is used. Otherwise errors
     * will occur when using the texture manager.
     */
    renderer;
    trackContextTexture(texture) {
        this.contextTextures.add(texture);
    }
    notifyContextLost() {
        this.stage.onContextLost();
    }
    untrackContextTexture(texture) {
        this.contextTextures.delete(texture);
        this.restoreTextures.delete(texture);
        this.pendingContextLoads.delete(texture);
    }
    // Drop old GPU handles without treating context loss as a texture error.
    invalidateContext() {
        this.contextGeneration++;
        this.uploadTextureQueue.clear();
        for (const texture of this.pendingContextLoads) {
            this.restoreTextures.add(texture);
            if (this.contextTextures.has(texture) === false)
                texture.invalidateContext();
        }
        this.pendingContextLoads.clear();
        for (const texture of this.contextTextures) {
            this.restoreTextures.add(texture);
            texture.invalidateContext();
        }
        this.contextTextures.clear();
    }
    restoreContext() {
        // Re-queue GPU-backed and pending resources through the normal throttled
        // path instead of firing all decodes at once: image restores stay queued
        // and drain via processSome() inside the per-frame budget (low-end
        // safe), while cheap non-image textures and the default texture reload
        // immediately. Explicit preloads without renderable owners are included;
        // previously evicted textures load on demand.
        const defaultTracked = this.stage.defaultTexture !== null &&
            this.restoreTextures.has(this.stage.defaultTexture);
        for (const texture of this.restoreTextures) {
            if (texture.type === TextureType.image)
                continue;
            this.restoreTextures.delete(texture);
            texture.load();
        }
        if (defaultTracked === false)
            this.stage.defaultTexture?.load();
    }
    /**
     * The current frame time in milliseconds
     *
     * @remarks
     * This is used to populate the `lastRenderableChangeTime` property of
     * {@link Texture} instances when their renderable state changes.
     *
     * Set by stage via `updateFrameTime` method.
     */
    frameTime = 0;
    constructor(stage, settings) {
        super();
        this.stage = stage;
        this.platform = stage.platform;
        this.maxRetryCount = settings.maxRetryCount;
        this.registerTextureType('ImageTexture', ImageTexture);
        this.registerTextureType('CanvasTextTexture', CanvasTextTexture);
        this.registerTextureType('ColorTexture', ColorTexture);
        this.registerTextureType('NoiseTexture', NoiseTexture);
        this.registerTextureType('SubTexture', SubTexture);
        this.registerTextureType('RenderTexture', RenderTexture);
    }
    registerTextureType(textureType, textureClass) {
        this.txConstructors[textureType] = textureClass;
    }
    /**
     * Enqueue a texture for uploading to the GPU.
     *
     * @param texture - The texture to upload
     */
    enqueueUploadTexture(texture) {
        this.uploadTextureQueue.enqueue(texture);
    }
    /**
     * Create a texture
     *
     * @param textureType - The type of texture to create
     * @param props - The properties to use for the texture
     */
    createTexture(textureType, props) {
        let texture;
        const TextureClass = this.txConstructors[textureType];
        if (!TextureClass) {
            throw new TextureError(TextureErrorCode.TEXTURE_TYPE_NOT_REGISTERED, `Texture type "${textureType}" is not registered`);
        }
        // Compute cache key from raw props first — avoids resolveDefaults
        // allocation on cache hits (the common case for repeated textures).
        const cacheKey = TextureClass.makeCacheKey(props);
        if (cacheKey && this.keyCache.has(cacheKey)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            texture = this.keyCache.get(cacheKey);
        }
        else {
            const resolvedProps = TextureClass.resolveDefaults(props);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            texture = new TextureClass(this, resolvedProps);
            if (cacheKey) {
                this.initTextureToCache(texture, cacheKey);
            }
        }
        return texture;
    }
    /**
     * Load a texture: fetch its data, then upload it to the GPU. Image
     * textures are queued for throttled upload unless `priority` is set.
     *
     * @remarks
     * Fire-and-forget: listen to the texture's `loaded` / `failed` events for
     * completion.
     *
     * @param texture - The texture to load
     * @param priority - Upload immediately instead of queueing (images only)
     */
    loadTexture(texture, priority) {
        if (this.stage.contextState !== 'running') {
            this.restoreTextures.add(texture);
            return;
        }
        if (
        // ignore subtextures - they get loaded through their parent
        texture.type === TextureType.subTexture ||
            // if the texture is already loaded, just return
            texture.state === 'loaded' ||
            // Covers fetch, decode, and GPU upload. A second call would
            // start a parallel load.
            texture.state === 'loading') {
            return;
        }
        const generation = this.contextGeneration;
        // A queued restore is now being handled (possibly demand-loaded before
        // the throttled drain reached it) — remove it so it isn't loaded twice.
        this.restoreTextures.delete(texture);
        this.pendingContextLoads.add(texture);
        texture.setState('loading');
        // Get texture data - early return on failure. In-memory sources resolve
        // synchronously so canvas text enqueues within the same update pass.
        let dataOrPromise;
        try {
            dataOrPromise = texture.getTextureData();
        }
        catch (err) {
            this.failTextureLoad(texture, generation, 'Failed to load texture:', err);
            return;
        }
        // Keep the resolved-data case as the primary path.
        if (isTextureDataPromise(dataOrPromise) === false) {
            this.uploadOrEnqueueTexture(texture, generation, priority);
            return;
        }
        this.loadTextureAsync(texture, dataOrPromise, generation, priority);
    }
    async loadTextureAsync(texture, dataPromise, generation, priority) {
        const loadGeneration = texture.loadGeneration;
        try {
            await dataPromise;
        }
        catch (err) {
            // Cancelled while fetching; a later load() owns the texture now.
            if (texture.loadGeneration !== loadGeneration)
                return;
            this.failTextureLoad(texture, generation, 'Failed to load texture:', err);
            return;
        }
        if (texture.loadGeneration !== loadGeneration)
            return;
        // The context was lost while fetching; invalidateContext() re-queued it.
        if (generation !== this.contextGeneration ||
            this.stage.contextState !== 'running') {
            return;
        }
        this.uploadOrEnqueueTexture(texture, generation, priority);
    }
    uploadOrEnqueueTexture(texture, generation, priority) {
        // Sources report failure via setState('failed') and resolve with
        // { data: null }; a null data alone is valid (e.g. RenderTexture).
        if (texture.state === 'failed') {
            this.pendingContextLoads.delete(texture);
            return;
        }
        // Handle non-image and priority textures: upload immediately
        if (texture.type !== TextureType.image || priority === true) {
            try {
                this.uploadTexture(texture);
            }
            catch (err) {
                this.failTextureLoad(texture, generation, 'Failed to upload texture:', err);
                return;
            }
            if (generation === this.contextGeneration)
                this.pendingContextLoads.delete(texture);
            return;
        }
        // Queue image textures for throttled upload
        this.enqueueUploadTexture(texture);
    }
    failTextureLoad(texture, generation, message, err) {
        if (generation !== this.contextGeneration) {
            // A stale load after context loss isn't a texture error; the restore
            // path reloads it.
            return;
        }
        console.error(message, err);
        texture.setState('failed', err instanceof Error ? err : new TextureError(String(err)));
        this.pendingContextLoads.delete(texture);
    }
    uploadTexture(texture) {
        if (this.stage.contextState !== 'running')
            return;
        const generation = this.contextGeneration;
        const finish = () => {
            if (generation === this.contextGeneration)
                this.pendingContextLoads.delete(texture);
        };
        if (this.stage.txMemManager.doNotExceedCriticalThreshold === true &&
            this.stage.txMemManager.criticalCleanupRequested === true) {
            // we're at a critical memory threshold, don't upload textures
            texture.setState('failed', new TextureError(TextureErrorCode.MEMORY_THRESHOLD_EXCEEDED));
            finish();
            return;
        }
        if (texture.state === 'failed' || texture.state === 'freed') {
            // don't upload failed or freed textures
            finish();
            return;
        }
        if (texture.state === 'loaded') {
            // already loaded
            finish();
            return;
        }
        if (texture.textureData === null) {
            texture.setState('failed', new TextureError(TextureErrorCode.TEXTURE_DATA_NULL, 'Texture data is null, cannot upload texture'));
            finish();
            return;
        }
        const coreContext = texture.loadCtxTexture();
        if (coreContext !== null && coreContext.state === 'loaded') {
            texture.setState('loaded');
            finish();
            return;
        }
        coreContext.load();
        finish();
    }
    /**
     * Check if a texture is being processed
     */
    isProcessingTexture(texture) {
        return this.uploadTextureQueue.has(texture);
    }
    /**
     * Process a limited number of uploads.
     *
     * @param maxProcessingTime - The maximum processing time in milliseconds
     * @param maxCount - The maximum number of textures to process in this call
     */
    processSome(maxProcessingTime, maxCount) {
        const platform = this.platform;
        const startTime = platform.getTimeStamp();
        let count = 0;
        // Drain queued context restores first within the same budget: each
        // load() kicks off an async decode and enqueues the GPU upload below,
        // so restores pipeline through the throttle instead of storming.
        // load() re-queues itself if the context became unavailable.
        while (this.restoreTextures.size > 0 &&
            count < maxCount &&
            platform.getTimeStamp() - startTime < maxProcessingTime) {
            const texture = this.restoreTextures.values().next().value;
            if (texture === undefined)
                break;
            this.restoreTextures.delete(texture);
            texture.load();
            count++;
        }
        // Process uploads - each upload completes synchronously within the budget
        while (this.uploadTextureQueue.size > 0 &&
            count < maxCount &&
            platform.getTimeStamp() - startTime < maxProcessingTime) {
            const texture = this.uploadTextureQueue.dequeue();
            if (texture === undefined)
                break;
            const generation = this.contextGeneration;
            try {
                this.uploadTexture(texture);
            }
            catch (error) {
                // Continue with next texture instead of stopping entire queue
                this.failTextureLoad(texture, generation, 'Failed to upload texture:', error);
            }
            count++;
        }
    }
    hasUpdates() {
        return this.uploadTextureQueue.size > 0 || this.restoreTextures.size > 0;
    }
    /**
     * Initialize a texture to the cache
     *
     * @param texture Texture to cache
     * @param cacheKey Cache key for the texture
     */
    initTextureToCache(texture, cacheKey) {
        this.keyCache.set(cacheKey, texture);
        texture.cacheKey = cacheKey;
    }
    /**
     * Get a texture from the cache
     *
     * @param cacheKey
     */
    getTextureFromCache(cacheKey) {
        return this.keyCache.get(cacheKey);
    }
    /**
     * Remove a texture from the cache
     *
     * @remarks
     * Called by Texture Cleanup when a texture is freed.
     *
     * @param texture
     */
    removeTextureFromCache(texture) {
        const cacheKey = texture.cacheKey;
        if (cacheKey !== null) {
            this.keyCache.delete(cacheKey);
            texture.cacheKey = null;
        }
    }
    /**
     * Remove texture from the upload queue
     *
     * @param texture - The texture to remove
     */
    removeTextureFromQueue(texture) {
        this.uploadTextureQueue.remove(texture);
    }
    /**
     * Drop a cancelled load from the upload queue and context-loss tracking.
     *
     * @param texture - The texture whose load was cancelled
     */
    forgetLoad(texture) {
        this.uploadTextureQueue.remove(texture);
        this.pendingContextLoads.delete(texture);
    }
    /**
     * Destroy the CoreTextureManager and release all internal references.
     *
     * @remarks
     * Clears the upload queue, context-loss tracking sets, and key/inverse-key
     * caches so that queued textures can be garbage-collected after a renderer
     * teardown — including a teardown while the context is lost with pending
     * restores. Bumps the context generation so in-flight decodes abort
     * instead of uploading after destroy.
     */
    destroy() {
        this.contextGeneration++;
        this.uploadTextureQueue.clear();
        this.contextTextures.clear();
        this.restoreTextures.clear();
        this.pendingContextLoads.clear();
        this.keyCache.clear();
    }
    /**
     * Resolve a parent texture from the cache or fallback to the provided texture.
     *
     * @param texture - The provided texture to resolve.
     * @returns The cached or provided texture.
     */
    resolveParentTexture(texture) {
        if (!texture?.props) {
            return texture;
        }
        const cacheKey = ImageTexture.makeCacheKey(texture.props);
        const cachedTexture = cacheKey
            ? this.getTextureFromCache(cacheKey)
            : undefined;
        return cachedTexture ?? texture;
    }
}
//# sourceMappingURL=CoreTextureManager.js.map