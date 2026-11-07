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

import Blits from '@lightningjs/blits';
import { CanvasTextRenderer } from '@lightningjs/renderer/canvas';
import {
  requestWebGpuDevice,
  WebGpuRenderer,
} from '@lightningjs/renderer/webgpu';

interface BlitsWebGpuMarker {
  ready: boolean;
  renderer: 'webgpu';
  focusedCard: 'left' | 'right';
}

declare global {
  var __lightningBlitsWebGpuSpike: BlitsWebGpuMarker | undefined;
}

interface CardParent {
  focusCard(ref: string): void;
}

const Card = Blits.Component('WebGpuCard', {
  props: {
    cardId: '',
    label: '',
    offsetX: 0,
    cardColor: '#000000ff',
  },
  template: `
    <Element :x="$offsetX" y="300" w="440" h="260" :color="$hasFocus ? '#ffffffff' : '#293347ff'">
      <Element x="8" y="8" w="424" h="244" :color="$cardColor">
        <Text x="0" y="82" w="424" h="72" :content="$label" size="48" align="center" color="#ffffffff" />
      </Element>
    </Element>
  `,
  hooks: {
    focus() {
      globalThis.__lightningBlitsWebGpuSpike = {
        ready: true,
        renderer: 'webgpu',
        focusedCard: this.cardId,
      };
    },
  },
  input: {
    left() {
      (this.$parent as CardParent).focusCard('LeftCard');
    },
    right() {
      (this.$parent as CardParent).focusCard('RightCard');
    },
  },
});

const App = Blits.Application({
  components: { Card },
  template: `
    <Element w="1920" h="1080" color="#07111fff">
      <Text x="120" y="100" w="1680" h="90" content="Blits application on Lightning WebGPU" size="64" align="center" color="#ffffffff" />
      <Text x="120" y="190" w="1680" h="50" content="Focus and component state are owned by Blits; drawing is owned by the new backend." size="30" align="center" color="#9fb4d0ff" />
      <Card ref="LeftCard" cardId="left" label="LEFT" offsetX="360" cardColor="#e50914ff" />
      <Card ref="RightCard" cardId="right" label="RIGHT" offsetX="1120" cardColor="#2563ebff" />
    </Element>
  `,
  methods: {
    focusCard(ref: string) {
      this.$select(ref).$focus();
    },
  },
  hooks: {
    focus() {
      this.focusCard('LeftCard');
    },
  },
});

const launch = async (): Promise<void> => {
  const device = await requestWebGpuDevice({
    powerPreference: 'high-performance',
    label: 'Lightning Blits WebGPU spike device',
  });
  const target = document.getElementById('app');
  if (target === null) {
    throw new Error('Blits WebGPU spike requires the #app element');
  }

  Blits.Launch(App, target, {
    w: 1920,
    h: 1080,
    screenResolution: 720,
    renderQuality: 'high',
    pixelRatio: 1,
    renderMode: 'webgpu',
    canvasColor: '#07111f',
    inputThrottle: 0,
    webWorkersLimit: 0,
    fpsInterval: 0,
    advanced: {
      renderEngine: WebGpuRenderer,
      fontEngines: [CanvasTextRenderer],
      webGpuDevice: device,
    },
  });
};

launch().catch((error: unknown) => {
  console.error(error);
});
