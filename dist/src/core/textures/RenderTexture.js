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
export class RenderTexture extends Texture {
    props;
    type = TextureType.renderToTexture;
    constructor(txManager, props) {
        super(txManager);
        this.props = props;
    }
    get w() {
        return this.props.w;
    }
    set w(value) {
        this.props.w = value;
    }
    get h() {
        return this.props.h;
    }
    set h(value) {
        this.props.h = value;
    }
    getTextureSource() {
        // Render texture data ready - dimensions will be set during upload
        return {
            data: null,
            premultiplyAlpha: null,
        };
    }
    static resolveDefaults(props) {
        return {
            w: props.w || 256,
            h: props.h || 256,
        };
    }
    static z$__type__Props;
}
//# sourceMappingURL=RenderTexture.js.map