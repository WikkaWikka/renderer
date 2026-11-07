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
export const WEBGPU_FLOATS_PER_VERTEX = 8;
export const WEBGPU_VERTICES_PER_QUAD = 6;
export const WEBGPU_FLOATS_PER_QUAD = WEBGPU_FLOATS_PER_VERTEX * WEBGPU_VERTICES_PER_QUAD;
const writeColor = (target, offset, packedAbgr) => {
    target[offset] = (packedAbgr & 0xff) / 255;
    target[offset + 1] = ((packedAbgr >>> 8) & 0xff) / 255;
    target[offset + 2] = ((packedAbgr >>> 16) & 0xff) / 255;
    target[offset + 3] = ((packedAbgr >>> 24) & 0xff) / 255;
};
const writeVertex = (target, offset, x, y, u, v, color, canvasWidth, canvasHeight, pixelRatio) => {
    target[offset] = (x * pixelRatio * 2) / canvasWidth - 1;
    target[offset + 1] = 1 - (y * pixelRatio * 2) / canvasHeight;
    target[offset + 2] = u;
    target[offset + 3] = v;
    writeColor(target, offset + 4, color);
};
export const writeWebGpuQuad = (target, offset, node, textureCoords, canvasWidth, canvasHeight, pixelRatio) => {
    const rc = node.renderCoords;
    if (rc === undefined) {
        throw new Error('Cannot write a WebGPU quad without render coordinates');
    }
    const colors = [
        node.premultipliedColorTl,
        node.premultipliedColorTr,
        node.premultipliedColorBl,
        node.premultipliedColorBr,
    ];
    const vertices = [
        [rc.x1, rc.y1, textureCoords.x1, textureCoords.y1, colors[0]],
        [rc.x2, rc.y2, textureCoords.x2, textureCoords.y1, colors[1]],
        [rc.x4, rc.y4, textureCoords.x1, textureCoords.y2, colors[2]],
        [rc.x4, rc.y4, textureCoords.x1, textureCoords.y2, colors[2]],
        [rc.x2, rc.y2, textureCoords.x2, textureCoords.y1, colors[1]],
        [rc.x3, rc.y3, textureCoords.x2, textureCoords.y2, colors[3]],
    ];
    let vertexOffset = offset;
    for (const vertex of vertices) {
        writeVertex(target, vertexOffset, vertex[0], vertex[1], vertex[2], vertex[3], vertex[4], canvasWidth, canvasHeight, pixelRatio);
        vertexOffset += WEBGPU_FLOATS_PER_VERTEX;
    }
};
export const toWebGpuScissorRect = (rect, canvasWidth, canvasHeight, pixelRatio) => {
    if (rect.valid !== true) {
        return { x: 0, y: 0, w: canvasWidth, h: canvasHeight };
    }
    const left = Math.max(0, Math.min(canvasWidth, Math.floor(rect.x * pixelRatio)));
    const top = Math.max(0, Math.min(canvasHeight, Math.floor(rect.y * pixelRatio)));
    const right = Math.max(left, Math.min(canvasWidth, Math.ceil((rect.x + rect.w) * pixelRatio)));
    const bottom = Math.max(top, Math.min(canvasHeight, Math.ceil((rect.y + rect.h) * pixelRatio)));
    return { x: left, y: top, w: right - left, h: bottom - top };
};
export const rgbaToGpuColor = (rgba) => {
    const alpha = (rgba & 0xff) / 255;
    return {
        r: ((rgba >>> 24) / 255) * alpha,
        g: (((rgba >>> 16) & 0xff) / 255) * alpha,
        b: (((rgba >>> 8) & 0xff) / 255) * alpha,
        a: alpha,
    };
};
//# sourceMappingURL=RendererUtils.js.map