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
import { Texture, TextureType } from './Texture.js';
import { hasImageBitmap } from '../platforms/capabilities.js';
/**
 * Texture consisting of an image loaded from a URL
 *
 * @remarks
 * The ImageTexture's {@link ImageTextureProps.src} prop defines the image URL
 * to be downloaded.
 *
 * By default, the texture's alpha values will be premultiplied into its color
 * values which is generally the desired setting before they are sent to the
 * texture's associated {@link Shader}. However, in special cases you may want
 * the Shader to receive straight (non-premultiplied) values. In that case you
 * can disable the default behavior by setting the
 * {@link ImageTextureProps.premultiplyAlpha} prop to `false`.
 */
export class ImageTexture extends Texture {
    platform;
    props;
    type = TextureType.image;
    constructor(txManager, props) {
        super(txManager);
        this.platform = txManager.platform;
        this.props = props;
        this.maxRetryCount = props.maxRetryCount;
    }
    getTextureSource() {
        const generation = this.loadGeneration;
        // Compressed textures are not supported by the Canvas2D renderer.
        // Fail fast here before incurring a network fetch or binary decode.
        if (this.txManager.renderer?.mode === 'canvas') {
            const { src, type } = this.props;
            if (type === 'compressed' ||
                (typeof src === 'string' && isCompressedTextureContainer(src) === true)) {
                const err = new Error(`ImageTexture: Compressed textures are not supported in Canvas2D render mode (src: ${String(src)})`);
                this.setState('failed', err);
                return { data: null };
            }
        }
        let result;
        try {
            result = this.determineImageTypeAndLoadImage();
        }
        catch (e) {
            if (generation !== this.loadGeneration)
                return { data: null };
            this.setState('failed', e);
            return {
                data: null,
            };
        }
        // TextureData always defines 'data' explicitly (even as null); a Promise
        // never has a 'data' property, so this distinguishes the two without an
        // instanceof check. Keep the resolved-data case as the primary path.
        if (result.data !== undefined) {
            return this.finishTextureSource(result, generation);
        }
        return result.then((resp) => this.finishTextureSource(resp, generation), (e) => {
            if (generation !== this.loadGeneration)
                return { data: null };
            this.setState('failed', e);
            return {
                data: null,
            };
        });
    }
    finishTextureSource(resp, generation) {
        if (generation !== this.loadGeneration) {
            if (hasImageBitmap === true &&
                resp.data instanceof ImageBitmap &&
                (typeof this.props.src === 'string' || this.props.src instanceof Blob)) {
                resp.data.close();
            }
            return { data: null };
        }
        if (resp.data === null) {
            this.setState('failed', Error('ImageTexture: No image data'));
            return {
                data: null,
            };
        }
        return {
            data: resp.data,
            premultiplyAlpha: this.props.premultiplyAlpha ?? true,
            premultiplied: resp.premultiplied,
        };
    }
    determineImageTypeAndLoadImage() {
        const { src, premultiplyAlpha, type, w, h, sx, sy, sw, sh } = this.props;
        const platform = this.platform;
        const premultiply = premultiplyAlpha ?? true;
        if (src === null) {
            return {
                data: null,
            };
        }
        if (typeof src !== 'string') {
            if (src instanceof Blob) {
                return platform.createImage(src, premultiply, sx, sy, sw, sh);
            }
            // ImageData, ImageBitmap, or HTMLCanvasElement
            return {
                data: typeof src === 'function' ? src() : src,
                premultiplyAlpha,
            };
        }
        if (type === 'regular') {
            return platform.loadImage(src, premultiply, sx, sy, sw, sh);
        }
        if (type === 'svg') {
            return platform.loadSvg(src, w, h, sx, sy, sw, sh);
        }
        if (isSvgImage(src) === true) {
            return platform.loadSvg(src, w, h, sx, sy, sw, sh);
        }
        if (type === 'compressed') {
            return platform.loadCompressedTexture(src);
        }
        if (isCompressedTextureContainer(src) === true) {
            return platform.loadCompressedTexture(src);
        }
        // default
        return platform.loadImage(src, premultiply, sx, sy, sw, sh);
    }
    /**
     * Generates a cache key for the ImageTexture based on the provided props.
     * @param props - The props used to generate the cache key.
     * @returns The cache key as a string, or `false` if the key cannot be generated.
     */
    static makeCacheKey(props) {
        // Only cache key-able textures; prioritise key
        const key = props.key || props.src;
        if (typeof key !== 'string') {
            return false;
        }
        let cacheKey = `ImageTexture,${key},${props.premultiplyAlpha ?? true},${props.maxRetryCount ?? 5}`;
        if (props.sh != null && props.sw != null) {
            cacheKey += ',';
            cacheKey += props.sx ?? '';
            cacheKey += props.sy ?? '';
            cacheKey += props.sw || '';
            cacheKey += props.sh || '';
        }
        return cacheKey;
    }
    static resolveDefaults(props) {
        return {
            src: props.src ?? '',
            premultiplyAlpha: props.premultiplyAlpha ?? true, // null,
            key: props.key ?? null,
            type: props.type ?? null,
            w: props.w ?? null,
            h: props.h ?? null,
            sx: props.sx ?? null,
            sy: props.sy ?? null,
            sw: props.sw ?? null,
            sh: props.sh ?? null,
            maxRetryCount: props.maxRetryCount ?? 5,
        };
    }
    static z$__type__Props;
}
/**
 * Tests if the given location is a SVG
 * @param url
 * @remarks
 * This function is used to determine if the given image url is a SVG
 * image
 * @returns
 */
export function isSvgImage(url) {
    // Bound the work done by the regex for caller-provided URLs.
    if (url.length > 1000) {
        return false;
    }
    return /\.(svg)(\?.*)?$/.test(url);
}
/**
 * Tests if the given location is a compressed texture container
 * @param url
 * @remarks
 * This function is used to determine if the given image url is a compressed
 * and only supports the following extensions: .ktx and .pvr
 * @returns
 */
export function isCompressedTextureContainer(src) {
    return /\.(ktx|pvr)$/.test(src);
}
//# sourceMappingURL=ImageTexture.js.map