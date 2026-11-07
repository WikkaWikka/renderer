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
import { RoundedWithShadowTemplate, } from '../templates/RoundedWithShadowTemplate.js';
import * as render from './utils/render.js';
export const RoundedWithShadow = {
    props: RoundedWithShadowTemplate.props,
    saveAndRestore: true,
    update(node) {
        const props = this.props;
        const radius = calcFactoredRadiusArray(props.radius, node.w, node.h);
        this.computed.radius = radius;
        this.computed.shadowColor = this.toColorString(props['shadow-color']);
        this.computed.shadowRadius = radius.map((value) => value + props['shadow-blur']);
    },
    render(ctx, node, renderContext) {
        const { tx, ty } = node.globalTransform;
        const { w, h } = node.props;
        const computed = this.computed;
        render.shadow(ctx, tx, ty, w, h, computed.shadowColor, this.props['shadow-projection'], computed.shadowRadius, this.stage.pixelRatio);
        ctx.beginPath();
        render.roundRect(ctx, tx, ty, w, h, computed.radius);
        ctx.clip();
        renderContext();
    },
};
//# sourceMappingURL=RoundedWithShadow.js.map