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
import { Texture, TextureType } from './Texture.js';
import { hasImageBitmap } from '../platforms/capabilities.js';
/**
 * Build a stable keyCache key for a canvas text raster.
 */
export function makeCanvasTextCacheKey(props) {
    return JSON.stringify([
        'CanvasText',
        props.richText === true ? 1 : 0,
        props.fontFamily,
        props.fontStyle,
        props.fontSize,
        props.letterSpacing,
        props.lineHeight,
        props.textAlign,
        props.maxLines,
        props.overflowSuffix,
        props.wordBreak,
        props.maxWidth,
        props.maxHeight,
        // Rich text bakes the node color into uncolored spans; plain text does not.
        props.richText === true ? props.color : 0,
        props.text,
    ]);
}
/**
 * Rasterized canvas text with a regenerable source. The draw callback must
 * capture a snapshot of the text layout, not a mutable CoreTextNode's props.
 *
 * This uses the image type so the existing upload queue, context restore,
 * memory cleanup, and Canvas2D renderer all treat it as an image texture.
 */
export class CanvasTextTexture extends Texture {
    type = TextureType.image;
    props;
    imageSource = null;
    constructor(txManager, props) {
        super(txManager);
        this.props = props;
    }
    getTextureSource() {
        // A previous upload can have scheduled source cleanup for the next
        // microtask. If we reload before it runs, release the previous source now
        // and don't let that cleanup dispose the new source instead.
        this.disposeSource();
        this.imageSource = this.props.render();
        return { data: this.imageSource, premultiplyAlpha: true };
    }
    disposeSource() {
        const source = this.imageSource;
        this.imageSource = null;
        if (source === null)
            return;
        if (hasImageBitmap === true && source instanceof ImageBitmap) {
            source.close?.();
        }
        else {
            const sourceCanvas = source;
            sourceCanvas.width = 0;
            sourceCanvas.height = 0;
        }
    }
    freeTextureData() {
        // WebGL has finished reading the source synchronously by the time it
        // requests this cleanup. Canvas2D keeps the image as its display source,
        // so it can only be released when its context texture is freed.
        if (this.txManager.renderer?.mode !== 'canvas') {
            const generation = this.loadGeneration;
            const source = this.imageSource;
            queueMicrotask(() => {
                if (generation === this.loadGeneration && this.imageSource === source) {
                    this.disposeSource();
                }
            });
        }
        super.freeTextureData();
    }
    free() {
        super.free();
        this.disposeSource();
    }
    /**
     * Release one owner's claim on this texture.
     *
     * @remarks
     * Drops `owner` from the renderable owners and aborts an in-flight load —
     * but only when no owner remains. A shared texture that other nodes still
     * need keeps loading untouched. GPU/data reclamation for unowned textures
     * happens through `TextureMemoryManager` cleanup, like image textures.
     */
    releaseOwner(owner) {
        this.setRenderableOwner(owner, false);
        if (this.state === 'loading' && this.renderableOwners.size === 0) {
            this.cancel();
        }
    }
    invalidateContext() {
        super.invalidateContext();
        this.disposeSource();
    }
    destroy() {
        super.destroy();
        this.disposeSource();
    }
    // Textures with an explicit stable key (see makeCanvasTextCacheKey) are
    // shared via the manager's keyCache, which is stage-scoped; ownership is
    // tracked per node via renderableOwners. Key-less textures stay uncached.
    static makeCacheKey(props) {
        return props.key ?? false;
    }
    static resolveDefaults(props) {
        return {
            render: props.render,
            key: props.key ?? null,
        };
    }
    static z$__type__Props;
}
//# sourceMappingURL=CanvasTextTexture.js.map