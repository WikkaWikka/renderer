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

import lightningLogo from '../assets/lightning.png';
import type { ExampleSettings } from '../common/ExampleSettings.js';

export default async function ({ renderer, testRoot }: ExampleSettings) {
  renderer.createNode({
    x: 0,
    y: 0,
    w: 1920,
    h: 1080,
    color: 0x07111fff,
    parent: testRoot,
  });

  renderer.createNode({
    x: 120,
    y: 120,
    w: 560,
    h: 320,
    colorTl: 0x2563ebff,
    colorTr: 0x7c3aedff,
    colorBl: 0x0f172aff,
    colorBr: 0x111827ff,
    parent: testRoot,
  });

  renderer.createNode({
    x: 760,
    y: 120,
    w: 480,
    h: 320,
    src: lightningLogo,
    color: 0xffffffff,
    parent: testRoot,
  });

  const clip = renderer.createNode({
    x: 120,
    y: 520,
    w: 1120,
    h: 220,
    clipping: true,
    color: 0x172033ff,
    parent: testRoot,
  });

  renderer.createNode({
    x: -80,
    y: 35,
    w: 1280,
    h: 150,
    colorLeft: 0xe50914ff,
    colorRight: 0xfacc15ff,
    rotation: -0.03,
    parent: clip,
  });

  renderer.createTextNode({
    x: 120,
    y: 800,
    maxWidth: 1500,
    maxHeight: 100,
    text: 'Lightning 3 — WebGPU backend spike',
    fontFamily: 'Ubuntu',
    fontSize: 54,
    color: 0xffffffff,
    parent: testRoot,
  });

  await renderer.stage.ready;
  globalThis.__lightningWebGpuSpike = {
    ready: true,
    mode: renderer.stage.renderer.mode,
    quads: renderer.stage.renderer.getQuadCount(),
  };
}

declare global {
  var __lightningWebGpuSpike:
    | { ready: boolean; mode: string | undefined; quads: number | null }
    | undefined;
}
