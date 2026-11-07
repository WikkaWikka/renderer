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
import { assertTruthy } from '../../../utils.js';
import { WebGlCtxTexture } from './WebGlCtxTexture.js';
export class WebGlCtxSubTexture extends WebGlCtxTexture {
    constructor(glw, memManager, textureSource) {
        super(glw, memManager, textureSource);
    }
    onLoadRequest() {
        const props = this.textureSource.textureData;
        assertTruthy(props, 'SubTexture must have texture data');
        if (props.data instanceof Uint8Array) {
            // its a 1x1 Color Texture
            return { w: 1, h: 1 };
        }
        return this.extractDimensions(props.data);
    }
    /**
     * Efficiently extracts width/height from polymorphic texture data
     * Optimized for performance by using type guards and avoiding unnecessary property access
     */
    extractDimensions(data) {
        if (data === null) {
            return { w: 0, h: 0 };
        }
        // Check for standard web API objects first (most common case)
        // These use width/height properties: ImageBitmap, ImageData, HTMLImageElement
        if (this.hasWidthHeight(data) === true) {
            return { w: data.width, h: data.height };
        }
        // Check for internal objects that use w/h properties: SubTextureProps, CompressedData
        if (this.hasWH(data) === true) {
            return { w: data.w, h: data.h };
        }
        // Fallback
        return { w: 0, h: 0 };
    }
    /**
     * Type guard for objects with width/height properties
     */
    hasWidthHeight(data) {
        return typeof data.width === 'number' && typeof data.height === 'number';
    }
    /**
     * Type guard for objects with w/h properties
     */
    hasWH(data) {
        return typeof data.w === 'number' && typeof data.h === 'number';
    }
}
//# sourceMappingURL=WebGlCtxSubTexture.js.map