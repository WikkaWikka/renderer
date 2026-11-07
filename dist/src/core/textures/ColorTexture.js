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
 * Texture consisting of only a 1x1 color pixel
 *
 * @remarks
 * The pixel color is set with the {@link ColorTextureProps.color} prop.
 *
 * This is the default texture used for a Node if it's
 * {@link INodeProps.texture} prop is set to `null` (the default)
 *
 * Generally the 1x1 color pixel is stretched to whatever the set dimensions of
 * a Node are.
 */
export class ColorTexture extends Texture {
    type = TextureType.color;
    props;
    constructor(txManager, props) {
        super(txManager);
        this.props = props;
    }
    get color() {
        return this.props.color;
    }
    set color(color) {
        this.props.color = color;
    }
    getTextureSource() {
        const pixelData = new Uint8Array(4);
        if (this.color === 0xffffffff) {
            pixelData[0] = 255;
            pixelData[1] = 255;
            pixelData[2] = 255;
            pixelData[3] = 255;
        }
        else {
            pixelData[0] = (this.color >> 16) & 0xff; // Red
            pixelData[1] = (this.color >> 8) & 0xff; // Green
            pixelData[2] = this.color & 0xff; // Blue
            pixelData[3] = (this.color >>> 24) & 0xff; // Alpha
        }
        return {
            data: pixelData,
            premultiplyAlpha: true,
        };
    }
    static makeCacheKey(props) {
        return `ColorTexture,${props.color || 0xffffffff}`;
    }
    static resolveDefaults(props) {
        return {
            color: props.color || 0xffffffff,
        };
    }
    static z$__type__Props;
}
//# sourceMappingURL=ColorTexture.js.map