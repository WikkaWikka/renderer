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
export const rgbaToCssHex = (rgba) => `#${(rgba >>> 0).toString(16).padStart(8, '0')}`;
export const decomposeHaltiTransform = (matrix) => {
    const scaleX = Math.hypot(matrix.ta, matrix.tc);
    const determinant = matrix.ta * matrix.td - matrix.tb * matrix.tc;
    const scaleY = scaleX === 0 ? Math.hypot(matrix.tb, matrix.td) : determinant / scaleX;
    const rotation = scaleX === 0 ? 0 : Math.atan2(matrix.tc, matrix.ta);
    const skewDot = matrix.ta * matrix.tb + matrix.tc * matrix.td;
    const skewDenominator = Math.max(1, Math.hypot(matrix.ta, matrix.tc) * Math.hypot(matrix.tb, matrix.td));
    return {
        x: matrix.tx,
        y: matrix.ty,
        scaleX,
        scaleY,
        rotation,
        hasSkew: Math.abs(skewDot / skewDenominator) > 0.0001,
    };
};
export const resolveHaltiContainerLayout = (clippingRect, appWidth, appHeight) => {
    if (clippingRect.valid !== true) {
        return {
            x: 0,
            y: 0,
            width: appWidth,
            height: appHeight,
            clip: false,
            contentOffsetX: 0,
            contentOffsetY: 0,
        };
    }
    return {
        x: clippingRect.x,
        y: clippingRect.y,
        width: Math.max(0, clippingRect.w),
        height: Math.max(0, clippingRect.h),
        clip: true,
        contentOffsetX: clippingRect.x,
        contentOffsetY: clippingRect.y,
    };
};
//# sourceMappingURL=RendererUtils.js.map