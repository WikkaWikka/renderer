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

import type { Dimensions } from '../../../common/CommonTypes.js';
import { hasImageBitmap } from '../../platforms/capabilities.js';
import type { TextureMemoryManager } from '../../TextureMemoryManager.js';
import type { SubTexture } from '../../textures/SubTexture.js';
import type { Texture, TextureData } from '../../textures/Texture.js';
import { CoreContextTexture } from '../CoreContextTexture.js';
import type { HaltiImageSourceRect } from './HaltiTypes.js';
import { rgbaToCssHex } from './internal/RendererUtils.js';

const WHITE = 0xffffffff;

const isImageData = (data: TextureData['data']): data is ImageData =>
  typeof ImageData !== 'undefined' && data instanceof ImageData;

const isCanvas = (data: TextureData['data']): data is HTMLCanvasElement =>
  typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement;

const isImage = (data: TextureData['data']): data is HTMLImageElement =>
  typeof HTMLImageElement !== 'undefined' && data instanceof HTMLImageElement;

const isBitmap = (data: TextureData['data']): data is ImageBitmap =>
  hasImageBitmap === true && data instanceof ImageBitmap;

export class HaltiContextTexture extends CoreContextTexture {
  private canvas: HTMLCanvasElement | null = null;
  private directUrl: string | null = null;
  private baseUrl: string | null = null;
  private readonly tintedUrls = new Map<number, string>();
  private dimensions: Dimensions = { w: 0, h: 0 };

  constructor(memManager: TextureMemoryManager, textureSource: Texture) {
    super(memManager, textureSource);
  }

  override load(): void {
    if (this.state === 'loaded' || this.state === 'loading') return;

    const textureData = this.textureSource.textureData;
    if (textureData === null) {
      throw new Error('Texture data is unavailable before Halti conversion');
    }

    this.state = 'loading';
    this.textureSource.setState('loading');

    try {
      this.capture(textureData.data);
      this.state = 'loaded';
      this.textureSource.setState('loaded', this.dimensions);
      this.textureSource.freeTextureData();
      this.setTextureMemUse(this.dimensions.w * this.dimensions.h * 4);
    } catch (error) {
      const normalized =
        error instanceof Error ? error : new Error(String(error));
      this.state = 'failed';
      this.textureSource.setState('failed', normalized);
      this.textureSource.freeTextureData();
      throw normalized;
    }
  }

  getUrl(color = WHITE): string | null {
    if (this.state === 'freed') this.load();
    if (this.state !== 'loaded') return null;

    const normalizedColor = color >>> 0;
    if (normalizedColor === WHITE) {
      return this.directUrl ?? this.getBaseUrl();
    }

    const cached = this.tintedUrls.get(normalizedColor);
    if (cached !== undefined) return cached;
    if (this.canvas === null) return this.directUrl ?? this.getBaseUrl();

    const tinted = document.createElement('canvas');
    tinted.width = this.canvas.width;
    tinted.height = this.canvas.height;
    const context = tinted.getContext('2d');
    if (context === null) return this.directUrl ?? this.getBaseUrl();

    context.fillStyle = rgbaToCssHex(normalizedColor);
    context.globalCompositeOperation = 'copy';
    context.fillRect(0, 0, tinted.width, tinted.height);
    context.globalCompositeOperation = 'multiply';
    context.drawImage(this.canvas, 0, 0);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(this.canvas, 0, 0);

    const url = tinted.toDataURL('image/png');
    this.tintedUrls.set(normalizedColor, url);
    return url;
  }

  private getBaseUrl(): string | null {
    if (this.baseUrl === null && this.canvas !== null) {
      this.baseUrl = this.canvas.toDataURL('image/png');
    }
    return this.baseUrl;
  }

  private capture(data: TextureData['data']): void {
    this.release();

    if (isImage(data) && data.src.length > 0) {
      this.directUrl = data.src;
    }

    if (
      typeof document === 'undefined' ||
      (!isImageData(data) &&
        !isCanvas(data) &&
        !isImage(data) &&
        !isBitmap(data))
    ) {
      this.dimensions = { w: 1, h: 1 };
      return;
    }

    const width = Math.max(1, data.width);
    const height = Math.max(1, data.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context === null) {
      throw new Error('Halti texture conversion requires a 2D canvas context');
    }

    if (isImageData(data)) {
      context.putImageData(data, 0, 0);
    } else {
      context.drawImage(data, 0, 0, width, height);
    }

    this.canvas = canvas;
    this.dimensions = { w: width, h: height };
  }

  override release(): void {
    if (this.canvas !== null) {
      this.canvas.width = 0;
      this.canvas.height = 0;
    }
    this.canvas = null;
    this.directUrl = null;
    this.baseUrl = null;
    this.tintedUrls.clear();
    this.dimensions = { w: 0, h: 0 };
    this.setTextureMemUse(0);
  }

  override free(): void {
    if (this.state === 'freed') return;
    this.state = 'freed';
    this.textureSource.setState('freed');
    this.release();
    this.textureSource.freeTextureData();
  }
}

export class HaltiSubTexture extends CoreContextTexture {
  constructor(memManager: TextureMemoryManager, textureSource: SubTexture) {
    super(memManager, textureSource);
  }

  private get source(): SubTexture {
    return this.textureSource as SubTexture;
  }

  private get parentContext(): HaltiContextTexture {
    return this.source.parentTexture.loadCtxTexture() as HaltiContextTexture;
  }

  get sourceRect(): HaltiImageSourceRect {
    const { x, y, w, h } = this.source.props;
    return { x, y, width: w, height: h };
  }

  getUrl(color = WHITE): string | null {
    return this.parentContext.getUrl(color);
  }

  override load(): void {
    this.parentContext.load();
    this.state = 'loaded';
    this.textureSource.setState('loaded', {
      w: this.source.props.w,
      h: this.source.props.h,
    });
  }

  override release(): void {
    // The parent context owns the converted image.
  }

  override free(): void {
    this.state = 'freed';
    this.textureSource.setState('freed');
    this.setTextureMemUse(0);
  }
}
