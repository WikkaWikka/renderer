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
export function getShadowProps(prefix) {
    const pf = prefix && prefix.length > 0 ? `${prefix}-` : '';
    const projection = pf + 'projection';
    return {
        [pf + 'color']: 0x000000ff,
        [projection]: {
            default: [0, 0, 5, 5],
        },
        [pf + 'x']: {
            default: 0,
            set(value, props) {
                props[projection][0] = value;
            },
            get(props) {
                return props[projection][0];
            },
        },
        [pf + 'y']: {
            default: 0,
            set(value, props) {
                props[projection][1] = value;
            },
            get(props) {
                return props[projection][1];
            },
        },
        [pf + 'blur']: {
            default: 10,
            set(value, props) {
                props[projection][2] = value;
            },
            get(props) {
                return props[projection][2];
            },
        },
        [pf + 'spread']: {
            default: 10,
            set(value, props) {
                props[projection][3] = value;
            },
            get(props) {
                return props[projection][3];
            },
        },
    };
}
export const ShadowTemplate = {
    props: getShadowProps(),
};
//# sourceMappingURL=ShadowTemplate.js.map