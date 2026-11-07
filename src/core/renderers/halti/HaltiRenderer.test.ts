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
import type { CoreNode } from '../../CoreNode.js';
import type { Stage } from '../../Stage.js';
import type { HaltiWidget } from './HaltiTypes.js';
import { HaltiRenderer } from './HaltiRenderer.js';

class TestWidget implements HaltiWidget {
  readonly children: HaltiWidget[] = [];
  private _parent: HaltiWidget | undefined;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: HaltiWidget['color'];
  opacity?: number;
  visible?: boolean;
  clip?: boolean;
  drawOrder?: number;
  rotateZ?: number;
  scaleX?: number;
  scaleY?: number;
  transformOriginX?: number;
  transformOriginY?: number;
  image = {};
  destroyed = false;

  get parent(): HaltiWidget | undefined {
    return this._parent;
  }

  set parent(value: HaltiWidget | undefined) {
    if (value === this._parent) return;
    if (this._parent !== undefined) {
      const previous = this._parent as TestWidget;
      const previousIndex = previous.children.indexOf(this);
      if (previousIndex >= 0) previous.children.splice(previousIndex, 1);
    }
    this._parent = undefined;
    if (value !== undefined) value.appendChild(this);
  }

  appendChild(child: HaltiWidget): void {
    const testChild = child as TestWidget;
    testChild.parent = undefined;
    const currentIndex = this.children.indexOf(child);
    if (currentIndex >= 0) this.children.splice(currentIndex, 1);
    this.children.push(child);
    testChild._parent = this;
  }

  destroy(): void {
    this.destroyed = true;
    this.parent = undefined;
  }
}

const solidTexture = {
  loadCtxTexture: () => ({ load: () => undefined }),
};

const makeNode = (id: number, x: number, color: number): CoreNode =>
  ({
    id,
    clippingRect: {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      valid: false,
      clipRadius: 0,
    },
    globalTransform: { ta: 1, tb: 0, tc: 0, td: 1, tx: x, ty: 40 },
    worldAlpha: 0.75,
    props: {
      w: 320,
      h: 180,
      colorTl: color,
      colorTr: color,
      colorBl: color,
      colorBr: color,
      shader: null,
      texture: solidTexture,
    },
  }) as unknown as CoreNode;

const makeRenderer = () => {
  const root = new TestWidget();
  const created: TestWidget[] = [];
  const ensureFrameRendered = vi.fn(() => Promise.resolve());
  const stage = {
    clearColor: 0x07111fff,
    defaultTexture: solidTexture,
    options: {
      appWidth: 1920,
      appHeight: 1080,
      halti: {
        root,
        createWidget: () => {
          const widget = new TestWidget();
          created.push(widget);
          return widget;
        },
        ensureFrameRendered,
      },
    },
  } as unknown as Stage;

  return {
    root,
    created,
    ensureFrameRendered,
    renderer: new HaltiRenderer(stage),
  };
};

describe('HaltiRenderer', () => {
  it('retains one widget pair per CoreNode and updates it in place', async () => {
    const { renderer, root, created, ensureFrameRendered } = makeRenderer();
    const node = makeNode(7, 120, 0xe50914ff);

    renderer.reset();
    renderer.addQuad(node);
    renderer.render();
    await renderer.waitForFrame();

    expect(created).toHaveLength(2);
    expect(root.children).toHaveLength(1);
    const container = root.children[0] as TestWidget;
    const content = container.children[0] as TestWidget;
    expect(content.name).toBe('lightning-halti-node-7');
    expect(content.x).toBe(120);
    expect(content.y).toBe(40);
    expect(content.width).toBe(320);
    expect(content.height).toBe(180);
    expect(content.opacity).toBe(0.75);
    expect(content.color).toBe('#e50914ff');

    const transform = node.globalTransform;
    if (transform === undefined) throw new Error('test node has no transform');
    transform.tx = 260;
    renderer.reset();
    renderer.addQuad(node);
    renderer.render();
    await renderer.waitForFrame();

    expect(created).toHaveLength(2);
    expect(root.children[0]).toBe(container);
    expect(content.x).toBe(260);
    expect(ensureFrameRendered).toHaveBeenCalledTimes(2);
  });

  it('reorders active nodes and destroys nodes omitted from a later frame', () => {
    const { renderer, root, created } = makeRenderer();
    const first = makeNode(1, 10, 0xffffffff);
    const second = makeNode(2, 20, 0xffffffff);

    renderer.reset();
    renderer.addQuad(first);
    renderer.addQuad(second);
    renderer.render();

    const firstContainer = root.children[0] as TestWidget;
    const firstContent = firstContainer.children[0] as TestWidget;
    const secondContainer = root.children[1] as TestWidget;

    renderer.reset();
    renderer.addQuad(second);
    renderer.render();

    expect(root.children).toEqual([secondContainer]);
    expect(firstContainer.destroyed).toBe(true);
    expect(firstContent.destroyed).toBe(true);
    expect(created).toHaveLength(4);
  });

  it('destroys every retained widget on renderer shutdown', () => {
    const { renderer, root, created } = makeRenderer();

    renderer.reset();
    renderer.addQuad(makeNode(1, 0, 0xffffffff));
    renderer.addQuad(makeNode(2, 0, 0xffffffff));
    renderer.render();
    renderer.destroy();

    expect(root.children).toHaveLength(0);
    expect(created.every((widget) => widget.destroyed)).toBe(true);
  });
});
