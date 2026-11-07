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

import { describe, expect, it, vi } from 'vitest';
import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import { TextureType, type Texture } from '../../textures/Texture.js';
import { HaltiContextTexture } from './HaltiContextTexture.js';

describe('HaltiContextTexture', () => {
  it('preserves a direct image URL without browser image primitives', () => {
    const setState = vi.fn();
    const freeTextureData = vi.fn();
    const texture = {
      type: TextureType.image,
      props: {
        src: 'data:image/png;base64,halti',
        w: 160,
        h: 90,
      },
      textureData: { data: new Uint8Array([1]) },
      renderable: true,
      setState,
      freeTextureData,
    } as unknown as Texture;
    const setTextureMemUse = vi.fn();
    const memory = { setTextureMemUse } as unknown as TextureMemoryManager;
    const context = new HaltiContextTexture(memory, texture);

    context.load();

    expect(context.getUrl()).toBe('data:image/png;base64,halti');
    expect(setState).toHaveBeenCalledWith('loaded', { w: 160, h: 90 });
    expect(setTextureMemUse).toHaveBeenCalledWith(texture, 160 * 90 * 4);
    expect(freeTextureData).toHaveBeenCalledOnce();
  });
});
