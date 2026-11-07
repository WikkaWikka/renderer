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
import type { CoreNode } from '../../../CoreNode.js';
import {
  rgbaToGpuColor,
  toWebGpuScissorRect,
  WEBGPU_FLOATS_PER_QUAD,
  writeWebGpuQuad,
} from './RendererUtils.js';

describe('WebGPU renderer utilities', () => {
  it('writes two triangles in normalized device coordinates', () => {
    const node = {
      renderCoords: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
        x3: 100,
        y3: 50,
        x4: 0,
        y4: 50,
      },
      premultipliedColorTl: 0xff0000ff,
      premultipliedColorTr: 0xff00ff00,
      premultipliedColorBl: 0xffff0000,
      premultipliedColorBr: 0xffffffff,
    } as CoreNode;
    const vertices = new Float32Array(WEBGPU_FLOATS_PER_QUAD);

    writeWebGpuQuad(
      vertices,
      0,
      node,
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      200,
      100,
      1,
    );

    expect(Array.from(vertices.slice(0, 8))).toEqual([-1, 1, 0, 0, 1, 0, 0, 1]);
    expect(Array.from(vertices.slice(8, 16))).toEqual([0, 1, 1, 0, 0, 1, 0, 1]);
    expect(Array.from(vertices.slice(40, 48))).toEqual([
      0, 0, 1, 1, 1, 1, 1, 1,
    ]);
  });

  it('converts and clamps logical clipping rectangles', () => {
    expect(
      toWebGpuScissorRect(
        { valid: true, x: -5, y: 10, w: 30, h: 50, clipRadius: 0 },
        80,
        60,
        2,
      ),
    ).toEqual({ x: 0, y: 20, w: 50, h: 40 });
  });

  it('uses the full viewport when clipping is disabled', () => {
    expect(
      toWebGpuScissorRect(
        { valid: false, x: 0, y: 0, w: 0, h: 0, clipRadius: 0 },
        1280,
        720,
        1,
      ),
    ).toEqual({ x: 0, y: 0, w: 1280, h: 720 });
  });

  it('premultiplies clear colors', () => {
    expect(rgbaToGpuColor(0x80402080)).toEqual({
      r: (128 / 255) * (128 / 255),
      g: (64 / 255) * (128 / 255),
      b: (32 / 255) * (128 / 255),
      a: 128 / 255,
    });
  });
});
