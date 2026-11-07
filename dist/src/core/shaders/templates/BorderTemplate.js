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
import { validateArrayLength4 } from '../utils.js';
export function getBorderProps(prefix) {
    const pf = prefix && prefix.length > 0 ? `${prefix}-` : '';
    const w = pf + 'w';
    return {
        [w]: {
            default: [0, 0, 0, 0],
            resolve(value) {
                if (value !== undefined) {
                    return validateArrayLength4(value);
                }
                return [].concat(this.default);
            },
        },
        [pf + 'color']: 0xffffffff,
        [pf + 'align']: {
            default: 0, //inside,
            resolve(value) {
                if (!isNaN(value)) {
                    return value;
                }
                if (typeof value === 'string') {
                    switch (value) {
                        case 'inside':
                            return 0;
                        case 'center':
                            return 0.5;
                        case 'outside':
                            return 1;
                    }
                }
                return this.default;
            },
        },
        [pf + 'gap']: 0,
        [pf + 'top']: {
            default: 0,
            set(value, props) {
                props[w][0] = value;
            },
            get(props) {
                return props[w][0];
            },
        },
        [pf + 'right']: {
            default: 0,
            set(value, props) {
                props[w][1] = value;
            },
            get(props) {
                return props[w][1];
            },
        },
        [pf + 'bottom']: {
            default: 0,
            set(value, props) {
                props[w][2] = value;
            },
            get(props) {
                return props[w][2];
            },
        },
        [pf + 'left']: {
            default: 0,
            set(value, props) {
                props[w][3] = value;
            },
            get(props) {
                return props[w][3];
            },
        },
    };
}
export const BorderTemplate = {
    props: getBorderProps(),
};
//# sourceMappingURL=BorderTemplate.js.map