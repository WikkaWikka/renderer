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

export interface HaltiImageSourceRect {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface HaltiImage {
  url?: string;
  halign?: string;
  valign?: string;
  sourceRect?: HaltiImageSourceRect;
}

/**
 * Structural subset of an NRDP Gibbon widget used by the experimental backend.
 * The interface is deliberately structural so the renderer package does not
 * depend on NRDP type declarations.
 */
export interface HaltiWidget {
  appendChild(child: HaltiWidget): void;
  insertBefore?(child: HaltiWidget, before: HaltiWidget): void;
  destroy?(): void;
  parent?: HaltiWidget;
  children?: HaltiWidget[];
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string | { r: number; g: number; b: number; a: number };
  opacity?: number;
  visible?: boolean;
  clip?: boolean;
  drawOrder?: number;
  rotateZ?: number;
  scaleX?: number;
  scaleY?: number;
  transformOriginX?: number;
  transformOriginY?: number;
  image?: HaltiImage;
}

export interface HaltiRendererOptions {
  /** Existing Gibbon widget that owns the Lightning-rendered subtree. */
  root: HaltiWidget;
  /** Factory normally backed by `nrdp.gibbon.makeWidget({})`. */
  createWidget: () => HaltiWidget;
  /** Optional Halti completion boundary, normally `Halti.ensureFrameRendered`. */
  ensureFrameRendered?: () => Promise<void>;
  /** Optional diagnostic hook for deliberately unsupported semantics. */
  warn?: (message: string) => void;
}
