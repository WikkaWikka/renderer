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
import { CoreContextTexture } from './CoreContextTexture.js';
export class CoreRenderer {
    mode;
    defaultTextureCoords = undefined;
    stage;
    //// Core Managers
    rttNodes = [];
    constructor(stage) {
        this.stage = stage;
    }
    /**
     * Delete a GPU buffer previously allocated by this renderer.
     * No-op for renderers that do not use WebGL buffers (e.g. Canvas).
     */
    deleteBuffer(_buffer) {
        // no-op default — overridden by WebGlRenderer
    }
    /**
     * Insert a begin-rounded-clip sentinel into the render op list before a
     * node's children are added. No-op on non-WebGL renderers.
     */
    beginRoundedClip(_node) {
        // no-op default — overridden by WebGlRenderer
    }
    /**
     * Insert an end-rounded-clip sentinel after a node's children have been
     * added. No-op on non-WebGL renderers.
     */
    endRoundedClip(_node) {
        // no-op default — overridden by WebGlRenderer
    }
}
//# sourceMappingURL=CoreRenderer.js.map