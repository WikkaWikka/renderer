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
/**
 * Texture consisting of a random grid of greyscale pixels
 *
 * @remarks
 * The width and height of the NoiseTexture are defined by it's
 * {@link NoiseTextureProps.width} and {@link NoiseTextureProps.height}
 * properties. The {@link NoiseTextureProps.cacheId} prop can be varied in order
 * to bypass cache and get newly randomized texture data.
 */
export class NoiseTexture extends Texture {
    props;
    type = TextureType.noise;
    constructor(txManager, props) {
        super(txManager);
        this.props = props;
    }
    getTextureSource() {
        const { w, h } = this.props;
        const size = w * h * 4;
        const pixelData8 = new Uint8ClampedArray(size);
        for (let i = 0; i < size; i += 4) {
            const v = Math.floor(Math.random() * 256);
            pixelData8[i] = v;
            pixelData8[i + 1] = v;
            pixelData8[i + 2] = v;
            pixelData8[i + 3] = 255;
        }
        // Noise Texture data ready - dimensions will be set during upload
        return {
            data: new ImageData(pixelData8, w, h),
        };
    }
    static makeCacheKey(props) {
        if (props.cacheId === undefined) {
            return false;
        }
        const resolvedProps = NoiseTexture.resolveDefaults(props);
        return `NoiseTexture,${resolvedProps.w},${resolvedProps.h},${resolvedProps.cacheId}`;
    }
    static resolveDefaults(props) {
        return {
            w: props.w ?? 128,
            h: props.h ?? 128,
            cacheId: props.cacheId ?? 0,
        };
    }
    static z$__type__Props;
}
//# sourceMappingURL=NoiseTexture.js.map