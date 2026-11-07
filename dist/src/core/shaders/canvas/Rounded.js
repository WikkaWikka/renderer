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
import { calcFactoredRadiusArray } from '../../lib/utils.js';
import { RoundedTemplate, } from '../templates/RoundedTemplate.js';
import { roundRect } from './utils/render.js';
export const Rounded = {
    props: RoundedTemplate.props,
    saveAndRestore: true,
    update(node) {
        this.computed.radius = calcFactoredRadiusArray(this.props.radius, node.w, node.h);
    },
    render(ctx, node, renderContext) {
        ctx.beginPath();
        roundRect(ctx, node.globalTransform.tx, node.globalTransform.ty, node.props.w, node.props.h, this.computed.radius);
        ctx.clip();
        renderContext();
    },
};
//# sourceMappingURL=Rounded.js.map