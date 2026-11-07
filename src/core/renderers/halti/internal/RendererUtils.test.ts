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

import { describe, expect, it } from 'vitest';
import {
  decomposeHaltiTransform,
  resolveHaltiContainerLayout,
  rgbaToCssHex,
} from './RendererUtils.js';

describe('Halti renderer utilities', () => {
  it('preserves packed Lightning RGBA colors', () => {
    expect(rgbaToCssHex(0xe50914ff)).toBe('#e50914ff');
    expect(rgbaToCssHex(-1)).toBe('#ffffffff');
  });

  it('decomposes translation, scale, and rotation', () => {
    const angle = Math.PI / 6;
    const transform = decomposeHaltiTransform({
      ta: Math.cos(angle) * 2,
      tb: -Math.sin(angle) * 3,
      tc: Math.sin(angle) * 2,
      td: Math.cos(angle) * 3,
      tx: 40,
      ty: 50,
    });

    expect(transform.x).toBe(40);
    expect(transform.y).toBe(50);
    expect(transform.scaleX).toBeCloseTo(2);
    expect(transform.scaleY).toBeCloseTo(3);
    expect(transform.rotation).toBeCloseTo(angle);
    expect(transform.hasSkew).toBe(false);
  });

  it('reports skew that cannot be represented by Gibbon widget transforms', () => {
    const transform = decomposeHaltiTransform({
      ta: 1,
      tb: 0.4,
      tc: 0,
      td: 1,
      tx: 0,
      ty: 0,
    });
    expect(transform.hasSkew).toBe(true);
  });

  it('uses a full application container when no clipping is active', () => {
    expect(
      resolveHaltiContainerLayout(
        { valid: false, x: 0, y: 0, w: 0, h: 0, clipRadius: 0 },
        1920,
        1080,
      ),
    ).toEqual({
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      clip: false,
      contentOffsetX: 0,
      contentOffsetY: 0,
    });
  });

  it('converts a global clipping rectangle into a widget container', () => {
    expect(
      resolveHaltiContainerLayout(
        { valid: true, x: 100, y: 80, w: 400, h: 220, clipRadius: 0 },
        1920,
        1080,
      ),
    ).toEqual({
      x: 100,
      y: 80,
      width: 400,
      height: 220,
      clip: true,
      contentOffsetX: 100,
      contentOffsetY: 80,
    });
  });
});
