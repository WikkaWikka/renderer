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
import { CoreContextTexture } from '../CoreContextTexture.js';
import { hasImageBitmap } from '../../platforms/capabilities.js';
const TRANSPARENT_PIXEL = new Uint8Array([0, 0, 0, 0]);
const isExternalImage = (data) => data !== null &&
    ((hasImageBitmap === true && data instanceof ImageBitmap) ||
        (typeof HTMLCanvasElement !== 'undefined' &&
            data instanceof HTMLCanvasElement) ||
        (typeof HTMLImageElement !== 'undefined' &&
            data instanceof HTMLImageElement));
const isImageData = (data) => typeof ImageData !== 'undefined' && data instanceof ImageData;
const GPU_TEXTURE_USAGE = {
    COPY_DST: 0x02,
    TEXTURE_BINDING: 0x04,
    RENDER_ATTACHMENT: 0x10,
};
export class WebGpuCtxTexture extends CoreContextTexture {
    device;
    nativeTexture = null;
    nativeView = null;
    _w = 0;
    _h = 0;
    generation = 0;
    constructor(device, memManager, textureSource) {
        super(memManager, textureSource);
        this.device = device;
    }
    get texture() {
        if (this.state === 'freed')
            this.load();
        return this.nativeTexture;
    }
    get view() {
        if (this.state === 'freed')
            this.load();
        return this.nativeView;
    }
    get w() {
        return this._w;
    }
    get h() {
        return this._h;
    }
    get version() {
        return this.generation;
    }
    load() {
        if (this.state === 'loading' || this.state === 'loaded')
            return;
        const textureData = this.textureSource.textureData;
        if (textureData === null) {
            throw new Error('Texture data is unavailable before WebGPU upload');
        }
        this.state = 'loading';
        this.textureSource.setState('loading');
        try {
            const dimensions = this.upload(textureData);
            this.state = 'loaded';
            this.textureSource.setState('loaded', dimensions);
            this.textureSource.freeTextureData();
        }
        catch (error) {
            this.state = 'failed';
            const normalized = error instanceof Error ? error : new Error(String(error));
            this.textureSource.setState('failed', normalized);
            this.textureSource.freeTextureData();
            throw normalized;
        }
    }
    upload(textureData) {
        const data = textureData.data;
        let width = 1;
        let height = 1;
        if (isImageData(data) || isExternalImage(data)) {
            width = data.width;
            height = data.height;
        }
        else if (data instanceof Uint8Array || data === null) {
            width = 1;
            height = 1;
        }
        else {
            throw new Error('Compressed and sub-texture uploads are not supported directly by the WebGPU context texture');
        }
        this.release();
        const texture = this.device.createTexture({
            label: `Lightning texture: ${this.textureSource.type}`,
            size: { width: Math.max(1, width), height: Math.max(1, height) },
            format: 'rgba8unorm',
            usage: GPU_TEXTURE_USAGE.TEXTURE_BINDING |
                GPU_TEXTURE_USAGE.COPY_DST |
                GPU_TEXTURE_USAGE.RENDER_ATTACHMENT,
        });
        if (isImageData(data)) {
            this.device.queue.writeTexture({ texture }, data.data, { bytesPerRow: data.width * 4, rowsPerImage: data.height }, { width: data.width, height: data.height });
        }
        else if (isExternalImage(data)) {
            this.device.queue.copyExternalImageToTexture({ source: data }, { texture, premultipliedAlpha: true }, { width, height });
        }
        else {
            const bytes = data instanceof Uint8Array ? data : TRANSPARENT_PIXEL;
            this.device.queue.writeTexture({ texture }, bytes, { bytesPerRow: 4 }, { width: 1, height: 1 });
        }
        this.nativeTexture = texture;
        this.nativeView = texture.createView();
        this._w = width;
        this._h = height;
        this.generation++;
        this.setTextureMemUse(width * height * 4);
        return { w: width, h: height };
    }
    release() {
        this.nativeTexture?.destroy();
        this.nativeTexture = null;
        this.nativeView = null;
        this._w = 0;
        this._h = 0;
        this.generation++;
        this.setTextureMemUse(0);
    }
    free() {
        if (this.state === 'freed')
            return;
        this.state = 'freed';
        this.textureSource.setState('freed');
        this.release();
        this.textureSource.freeTextureData();
    }
}
//# sourceMappingURL=WebGpuCtxTexture.js.map