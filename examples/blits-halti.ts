/*
 * Browser proof that a real Blits application can retain its component,
 * reactivity, and focus model while Lightning renders through Halti widgets.
 */

import Blits from '@lightningjs/blits';
import { CanvasTextRenderer } from '@lightningjs/renderer/canvas';
import { HaltiRenderer } from '@lightningjs/renderer/halti';
import lightningLogo from './assets/lightning.png';
import { createHaltiDomDriver } from './common/HaltiDomDriver.js';

interface BlitsHaltiMarker {
  ready: boolean;
  renderer: 'halti';
  focusedCard: 'left' | 'right';
  warnings: string[];
}

declare global {
  var __lightningBlitsHaltiSpike: BlitsHaltiMarker | undefined;
}

interface CardParent {
  focusCard(ref: string): void;
}

const Card = Blits.Component('HaltiCard', {
  props: {
    cardId: '',
    label: '',
    offsetX: 0,
    cardColor: '#000000ff',
  },
  state() {
    return { selected: false };
  },
  template: `
    <Element :x="$offsetX" y="390" w="440" h="260" :color="$selected ? '#ffffffff' : '#293347ff'">
      <Element x="8" y="8" w="424" h="244" :color="$cardColor">
        <Text x="120" y="82" w="184" h="72" :content="$label" size="48" align="center" color="#ffffffff" />
      </Element>
    </Element>
  `,
  hooks: {
    focus() {
      this.selected = true;
      globalThis.__lightningBlitsHaltiSpike = {
        ready: true,
        renderer: 'halti',
        focusedCard: this.cardId,
        warnings: driver.warnings,
      };
    },
    unfocus() {
      this.selected = false;
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
  state() {
    return { logo: lightningLogo };
  },
  template: `
    <Element w="1920" h="1080" color="#07111fff">
      <Text x="120" y="92" w="1680" h="90" content="Blits on Halti" size="72" color="#ffffffff" />
      <Text x="120" y="190" w="1680" h="50" content="Blits owns components and focus. Lightning maps the scene to persistent Halti widgets." size="30" color="#9fb4d0ff" />
      <Element x="120" y="270" w="1680" h="84" clipping="true" color="#121d31ff">
        <Element x="-40" y="16" w="1760" h="52" color="#e50914ff" />
      </Element>
      <Element x="810" y="720" w="300" h="180" :src="$logo" />
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

const target = document.getElementById('app');
if (target === null) throw new Error('Blits Halti spike requires #app');

const driver = createHaltiDomDriver(target, 1920, 1080);

Blits.Launch(App, target, {
  w: 1920,
  h: 1080,
  screenResolution: 720,
  pixelRatio: 1,
  renderQuality: 'high',
  renderMode: 'canvas',
  canvas: driver.canvas,
  canvasColor: '#07111f',
  inputThrottle: 0,
  webWorkersLimit: 0,
  fpsInterval: 0,
  advanced: {
    renderEngine: HaltiRenderer,
    fontEngines: [CanvasTextRenderer],
    halti: driver.rendererOptions,
  },
});
