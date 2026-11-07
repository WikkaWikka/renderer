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
import { CoreContextTexture } from '../CoreContextTexture.js';
export class WebGpuCtxSubTexture extends CoreContextTexture {
    constructor(memManager, textureSource) {
        super(memManager, textureSource);
    }
    get parentContextTexture() {
        const subTexture = this.textureSource;
        return subTexture.parentTexture.loadCtxTexture();
    }
    get texture() {
        return this.parentContextTexture.texture;
    }
    get view() {
        return this.parentContextTexture.view;
    }
    get version() {
        return this.parentContextTexture.version;
    }
    load() {
        const subTexture = this.textureSource;
        this.parentContextTexture.load();
        this.state = 'loaded';
        this.textureSource.setState('loaded', {
            w: subTexture.props.w,
            h: subTexture.props.h,
        });
    }
    release() {
        // The parent texture owns the GPU allocation.
    }
    free() {
        this.state = 'freed';
        this.textureSource.setState('freed');
        this.setTextureMemUse(0);
    }
}
//# sourceMappingURL=WebGpuCtxSubTexture.js.map