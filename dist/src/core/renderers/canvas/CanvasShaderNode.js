/*
 * Copyright 2023 Comcast Cable Communications Management, LLC
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
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { normalizeCanvasColor } from '../../lib/colorCache.js';
import { CoreShaderNode } from '../CoreShaderNode.js';
export class CanvasShaderNode extends CoreShaderNode {
    updater = undefined;
    valueKey = '';
    computed = {};
    applySNR;
    render;
    constructor(shaderKey, config, stage, props) {
        super(shaderKey, config, stage, props);
        this.applySNR = config.saveAndRestore || false;
        this.render = config.render;
        if (config.update !== undefined) {
            this.updater = config.update;
            if (this.props === undefined) {
                this.updater(this.node, this.props);
                return;
            }
            this.update = () => {
                const prevKey = this.valueKey;
                this.valueKey = this.createValueKey();
                if (prevKey === this.valueKey) {
                    return;
                }
                if (prevKey.length > 0) {
                    stage.shManager.mutateShaderValueUsage(prevKey, -1);
                }
                const computed = stage.shManager.getShaderValues(this.valueKey);
                if (computed !== undefined) {
                    this.computed = computed;
                }
                this.computed = {};
                this.updater(this.node);
                stage.shManager.setShaderValues(this.valueKey, this.computed);
            };
        }
    }
    toColorString(rgba) {
        return normalizeCanvasColor(rgba);
    }
}
//# sourceMappingURL=CanvasShaderNode.js.map