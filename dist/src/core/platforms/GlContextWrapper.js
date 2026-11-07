/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2026 Comcast Cable Communications Management, LLC.
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
/**
 * Abstract GL Context Wrapper
 *
 * @remarks
 * This abstract class defines the interface for rendering context wrappers.
 * Implementations should provide optimized state management and caching
 * to avoid redundant API calls when the state is already set to the desired value.
 *
 * The interface is designed to be compatible with WebGL-like rendering contexts
 * but can be adapted for other rendering backends (Canvas2D, WebGPU, Native, etc.).
 */
export class GlContextWrapper {
    // Platforms without WebGL context-loss reporting can retain the default.
    isContextLost() {
        return false;
    }
}
//# sourceMappingURL=GlContextWrapper.js.map