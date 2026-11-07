# Experimental WebGPU backend

This branch contains a bounded WebGPU backend spike for the Lightning 3 renderer. The rendering backend belongs to **Lightning 3 Renderer**; Blits remains the application framework that consumes it.

The spike answers the first architectural question: Lightning's existing `CoreRenderer` seam can drive WebGPU without replacing the component tree, layout, focus, input, animation, texture, or Canvas text systems.

## What works

- colored and textured quads;
- transformed quads using Lightning's computed render coordinates;
- corner colors and alpha blending;
- rectangular clipping through WebGPU scissor rectangles;
- image, canvas, `ImageData`, and raw RGBA textures;
- subtextures;
- Canvas text textures;
- renderer reset, viewport reconfiguration, texture release, and renderer teardown;
- a Blits application with remote-key focus changes.

The implementation uses a host-created `GPUDevice`. Device acquisition is asynchronous, while `RendererMain` construction is synchronous, so applications request the device before creating the renderer.

```ts
import { RendererMain } from '@lightningjs/renderer';
import { CanvasTextRenderer } from '@lightningjs/renderer/canvas';
import {
  requestWebGpuDevice,
  WebGpuRenderer,
} from '@lightningjs/renderer/webgpu';

const webGpuDevice = await requestWebGpuDevice();

const renderer = new RendererMain({
  appWidth: 1920,
  appHeight: 1080,
  renderEngine: WebGpuRenderer,
  fontEngines: [CanvasTextRenderer],
  webGpuDevice,
});
```

## Blits proof

Blits already exposes an `advanced` renderer-settings escape hatch. The example at `examples/blits-webgpu.ts` uses that seam, so the spike does not require a new integration layer or a fork-specific host protocol.

```ts
Blits.Launch(App, target, {
  renderMode: 'webgpu',
  advanced: {
    renderEngine: WebGpuRenderer,
    fontEngines: [CanvasTextRenderer],
    webGpuDevice,
  },
});
```

Run the renderer-native proof at:

```text
?test=webgpu-spike&renderMode=webgpu&overlay=false&resolution=720
```

Run the Blits proof at:

```text
?app=blits-webgpu
```

## Deliberately out of scope

This is not yet a production-complete replacement for the WebGL backend. The following need dedicated WebGPU implementations:

- custom shaders and Blits shader effects;
- rounded clipping and stencil-based masks;
- render-to-texture;
- SDF text;
- compressed textures;
- WebGPU-specific batching and draw-call reduction;
- device-loss recovery and capability negotiation;
- automated pixel baselines across supported GPU/browser combinations.

The spike currently emits one WebGPU draw per quad. That is useful for validating architecture and behavior, not for making performance claims.

## Exit criteria for a production effort

Before treating WebGPU as a supported renderer mode, the backend should pass the existing visual-regression corpus, add WebGPU baselines, implement shader/effect parity, recover from device loss, and define supported browser/device capabilities. The current result is evidence that the port is feasible—not evidence that the port is finished.
