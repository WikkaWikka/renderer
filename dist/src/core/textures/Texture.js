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
import { EventEmitter } from '../../common/EventEmitter.js';
/**
 * Distinguish pending texture data from resolved data.
 *
 * @remarks
 * TextureData always defines 'data' explicitly (even as null); a Promise
 * never has a 'data' property, so this distinguishes the two without an
 * instanceof check.
 */
export function isTextureDataPromise(value) {
    return value.data === undefined;
}
export var TextureType;
(function (TextureType) {
    TextureType[TextureType["generic"] = 0] = "generic";
    TextureType[TextureType["color"] = 1] = "color";
    TextureType[TextureType["image"] = 2] = "image";
    TextureType[TextureType["noise"] = 3] = "noise";
    TextureType[TextureType["renderToTexture"] = 4] = "renderToTexture";
    TextureType[TextureType["subTexture"] = 5] = "subTexture";
})(TextureType || (TextureType = {}));
/**
 * Represents a source of texture data for a CoreContextTexture.
 *
 * @remarks
 * Texture sources are used to populate a CoreContextTexture when that texture
 * is loaded. Texture data retrieved by the CoreContextTexture by the
 * `getTextureData` method. It's the responsibility of the concerete `Texture`
 * subclass to implement this method appropriately.
 */
export class Texture extends EventEmitter {
    txManager;
    /**
     * The dimensions of the texture
     *
     * @remarks
     * Until the texture data is loaded for the first time the value will be
     * `null`.
     */
    _dimensions = null;
    _error = null;
    // aggregate state
    state = 'initial';
    renderableOwners = new Set();
    renderable = false;
    type = TextureType.generic;
    preventCleanup = false;
    ctxTexture;
    loadGeneration = 0;
    notifyContextLost() {
        this.txManager.notifyContextLost();
    }
    textureData = null;
    memUsed = 0;
    /**
     * Cache key assigned by CoreTextureManager when this texture is stored
     * in the key cache. `null` when the texture is not cached.
     */
    cacheKey = null;
    /**
     * Memory used by this texture in bytes
     *
     * @remarks
     * This is tracked by the TextureMemoryManager and updated when the texture
     * is loaded/freed. Set to 0 when texture is not loaded.
     */
    retryCount = 0;
    maxRetryCount;
    /**
     * Timestamp when texture was created (for startup grace period)
     */
    createdAt = Date.now();
    /**
     * Flag to track if grace period has expired to avoid repeated Date.now() calls
     */
    gracePeriodExpired = false;
    /**
     * Grace period in milliseconds to prevent premature cleanup during app startup
     * This helps prevent race conditions when bounds calculation is delayed
     */
    static STARTUP_GRACE_PERIOD = 2000; // 2 seconds
    constructor(txManager) {
        super();
        this.txManager = txManager;
        this.maxRetryCount = txManager.maxRetryCount;
    }
    get dimensions() {
        return this._dimensions;
    }
    get error() {
        return this._error;
    }
    /**
     * Checks if the texture is within the startup grace period.
     * During this period, textures are protected from cleanup to prevent
     * race conditions during app initialization.
     */
    isWithinStartupGracePeriod() {
        // If grace period already expired, return false immediately
        if (this.gracePeriodExpired === true) {
            return false;
        }
        // Check if grace period has expired now
        const hasExpired = Date.now() - this.createdAt >= Texture.STARTUP_GRACE_PERIOD;
        if (hasExpired) {
            // Cache the result to avoid future Date.now() calls
            this.gracePeriodExpired = true;
            return false;
        }
        return true;
    }
    /**
     * Checks if the texture can be safely cleaned up.
     * Considers the renderable state, startup grace period, and renderable owners.
     */
    canBeCleanedUp() {
        // Never cleanup if explicitly prevented
        if (this.preventCleanup) {
            return false;
        }
        // Don't cleanup if still within startup grace period
        if (this.isWithinStartupGracePeriod()) {
            return false;
        }
        // Don't cleanup a texture that is in the process of loading
        if (this.state === 'loading') {
            return false;
        }
        // Don't cleanup if not renderable
        if (this.renderable === true) {
            return false;
        }
        // Don't cleanup if there are still renderable owners
        if (this.renderableOwners.size > 0) {
            return false;
        }
        // Safe to cleanup
        return true;
    }
    /**
     * Add/remove an owner to/from the Texture based on its renderability.
     *
     * @remarks
     * Any object can own a texture, be it a CoreNode or even the state object
     * from a Text Renderer.
     *
     * When the reference to the texture that an owner object holds is replaced
     * or cleared it must call this with `renderable=false` to release the owner
     * association.
     *
     * @param owner
     * @param renderable
     */
    setRenderableOwner(owner, renderable) {
        const owners = this.renderableOwners;
        if (renderable === true) {
            if (owners.has(owner) === true) {
                return;
            }
            owners.add(owner);
            if (owners.size === 1) {
                this.renderable = true;
                this.onChangeIsRenderable?.(true);
                this.load();
            }
        }
        else {
            if (owners.has(owner) === false) {
                return;
            }
            owners.delete(owner);
            if (owners.size === 0) {
                this.renderable = false;
                this.onChangeIsRenderable?.(false);
            }
        }
    }
    load() {
        if (this.retryCount > this.maxRetryCount) {
            // We've exceeded the max retry count, do not attempt to load again
            return;
        }
        this.txManager.loadTexture(this);
    }
    /**
     * Cancel the in-flight load and return to `initial`; `load()` restarts it.
     *
     * @remarks
     * Bumping the generation drops the result when it arrives, like a load
     * that was in flight during context loss; {@link abortLoad} additionally
     * stops the request where the platform supports it.
     * A texture can be shared, this is a no-op while more than one owner
     * requires it.
     *
     * Priority loads are not guarded.
     */
    cancel() {
        if (this.state !== 'loading' || this.renderableOwners.size > 1) {
            return;
        }
        this.loadGeneration++;
        this.txManager.forgetLoad(this);
        this.textureData = null;
        this.setState('initial');
    }
    /**
     * Load the core context texture for this Texture.
     * The ctxTexture is created by the renderer and lives on the GPU.
     *
     * @returns
     */
    loadCtxTexture() {
        if (this.ctxTexture === undefined) {
            this.ctxTexture = this.txManager.renderer.createCtxTexture(this);
            this.txManager.trackContextTexture(this);
        }
        return this.ctxTexture;
    }
    /**
     * Free the core context texture for this Texture.
     *
     * @remarks
     * The ctxTexture is created by the renderer and lives on the GPU.
     */
    free() {
        this.ctxTexture?.free();
        this.ctxTexture = undefined;
        this.txManager.untrackContextTexture(this);
    }
    /**
     * Release the texture data and core context texture for this Texture without changing state.
     *
     * @remarks
     * The ctxTexture is created by the renderer and lives on the GPU.
     */
    release() {
        this.ctxTexture?.release();
        this.ctxTexture = undefined;
        this.txManager.untrackContextTexture(this);
        this.freeTextureData();
    }
    // The browser has already discarded this generation's GPU resources.
    invalidateContext() {
        this.loadGeneration++;
        if (this.ctxTexture !== undefined &&
            'invalidateContext' in this.ctxTexture) {
            this.ctxTexture.invalidateContext();
        }
        this.ctxTexture = undefined;
        if (this.state !== 'failed')
            this.state = 'freed';
        // A decoded image may have been closed after its first upload.
        this.textureData = null;
        this.memUsed = 0;
    }
    /**
     * Destroy the texture.
     *
     * @remarks
     * This method is called when the texture is no longer needed and should be
     * cleaned up.
     */
    destroy() {
        // Free GPU resources whenever they exist, not just in the 'loaded' state.
        // A texture destroyed mid-upload (e.g. a canvas text texture released on a
        // text change) can have an allocated ctxTexture while still reporting
        // 'loading', and gating on state alone would strand it.
        if (this.ctxTexture !== undefined) {
            this.free();
        }
        this.txManager.untrackContextTexture(this);
        // Always free texture data regardless of state
        this.freeTextureData();
    }
    /**
     * Free the source texture data for this Texture.
     *
     * @remarks
     * The texture data is the source data that is used to populate the CoreContextTexture.
     * e.g. ImageData that is downloaded from a URL.
     */
    freeTextureData() {
        const generation = this.loadGeneration;
        queueMicrotask(() => {
            if (generation === this.loadGeneration)
                this.freeTextureDataTask();
        });
    }
    setState(state, errorOrDimensions) {
        if (this.state === state) {
            return;
        }
        let payload = null;
        if (state === 'loaded') {
            if (errorOrDimensions !== undefined &&
                'w' in errorOrDimensions === true &&
                'h' in errorOrDimensions === true) {
                this._dimensions = errorOrDimensions;
            }
            payload = this._dimensions;
        }
        else if (state === 'failed') {
            this._error = errorOrDimensions;
            payload = this._error;
            // increment the retry count for the texture
            // this is used to compare against maxRetryCount, if set
            // to determine if we should try loading again
            this.retryCount += 1;
            const generation = this.loadGeneration;
            queueMicrotask(() => {
                if (generation === this.loadGeneration)
                    this.releaseTask();
            });
        }
        else if (state === 'loading') {
            this._error = null;
            this._dimensions = null;
        }
        else {
            this._error = null;
        }
        // emit the new state
        this.state = state;
        this.emit(state, payload);
    }
    /**
     * Get the texture data for this texture.
     *
     * @remarks
     * This method is called by the CoreContextTexture when the texture is loaded.
     * The texture data is then used to populate the CoreContextTexture.
     *
     * @returns
     * The texture data for this texture.
     */
    getTextureData() {
        if (this.textureData !== null) {
            return this.textureData;
        }
        const generation = this.loadGeneration;
        const sourceOrPromise = this.getTextureSource();
        // Keep the resolved-data case as the primary path.
        if (isTextureDataPromise(sourceOrPromise) === false) {
            if (generation === this.loadGeneration) {
                this.textureData = sourceOrPromise;
            }
            return sourceOrPromise;
        }
        return sourceOrPromise.then((data) => {
            if (generation === this.loadGeneration) {
                this.textureData = data;
            }
            return data;
        });
    }
    /**
     * Task for queueMicrotask to free texture data.
     *
     * @remarks
     * This method is called in a microtask to free the texture data.
     */
    freeTextureDataTask = () => {
        this.textureData = null;
    };
    /**
     * Task for queueMicrotask to release the texture.
     *
     * @remarks
     * This method is called in a microtask to release the texture.
     */
    releaseTask = () => {
        this.release();
    };
    /**
     * Make a cache key for this texture.
     *
     * @remarks
     * Each concrete `Texture` subclass must implement this method to provide an
     * appropriate cache key for the texture type including the texture's
     * properties that uniquely identify a copy of the texture. If the texture
     * type does not support caching, then this method should return `false`.
     *
     * @param props
     * @returns
     * A cache key for this texture or `false` if the texture type does not
     * support caching.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static makeCacheKey(props) {
        return false;
    }
    /**
     * Resolve the default values for the texture's properties.
     *
     * @remarks
     * Each concrete `Texture` subclass must implement this method to provide
     * default values for the texture's optional properties.
     *
     * @param props
     * @returns
     * The default values for the texture's properties.
     */
    static resolveDefaults(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    props) {
        return {};
    }
}
//# sourceMappingURL=Texture.js.map