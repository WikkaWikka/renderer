/*
 * Browser-only structural Gibbon widget driver for the Halti spike example.
 * It validates the Lightning-to-Halti property contract without pretending to
 * be the production Halti renderer.
 */

import type {
  HaltiImage,
  HaltiImageSourceRect,
  HaltiRendererOptions,
  HaltiWidget,
} from '@lightningjs/renderer/halti';

class DomHaltiImage implements HaltiImage {
  private _url: string | undefined;
  private _sourceRect: HaltiImageSourceRect | undefined;

  constructor(private readonly element: HTMLDivElement) {}

  get url(): string | undefined {
    return this._url;
  }

  set url(value: string | undefined) {
    this._url = value;
    this.element.style.backgroundImage = value
      ? `url(${JSON.stringify(value)})`
      : '';
    this.element.style.backgroundRepeat = 'no-repeat';
    this.element.style.backgroundPosition = 'center';
    this.element.style.backgroundSize = '100% 100%';
  }

  get sourceRect(): HaltiImageSourceRect | undefined {
    return this._sourceRect;
  }

  set sourceRect(value: HaltiImageSourceRect | undefined) {
    this._sourceRect = value;
  }

  halign?: string;
  valign?: string;
}

class DomHaltiWidget implements HaltiWidget {
  readonly children: HaltiWidget[] = [];
  readonly image: HaltiImage;
  readonly element: HTMLDivElement;
  private _parent: HaltiWidget | undefined;
  private _name: string | undefined;
  private _x = 0;
  private _y = 0;
  private _width = 0;
  private _height = 0;
  private _rotateZ = 0;
  private _scaleX = 1;
  private _scaleY = 1;

  constructor(element?: HTMLDivElement) {
    this.element = element ?? document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.transformOrigin = '0 0';
    this.element.style.boxSizing = 'border-box';
    this.image = new DomHaltiImage(this.element);
  }

  appendChild(child: HaltiWidget): void {
    const domChild = child as DomHaltiWidget;
    if (domChild._parent !== undefined) {
      const oldParent = domChild._parent as DomHaltiWidget;
      const oldIndex = oldParent.children.indexOf(child);
      if (oldIndex >= 0) oldParent.children.splice(oldIndex, 1);
    }
    const existingIndex = this.children.indexOf(child);
    if (existingIndex >= 0) this.children.splice(existingIndex, 1);
    this.children.push(child);
    domChild._parent = this;
    this.element.appendChild(domChild.element);
  }

  insertBefore(child: HaltiWidget, before: HaltiWidget): void {
    const domChild = child as DomHaltiWidget;
    const domBefore = before as DomHaltiWidget;
    this.appendChild(child);
    const childIndex = this.children.indexOf(child);
    const beforeIndex = this.children.indexOf(before);
    if (childIndex >= 0) this.children.splice(childIndex, 1);
    this.children.splice(Math.max(0, beforeIndex), 0, child);
    this.element.insertBefore(domChild.element, domBefore.element);
  }

  destroy(): void {
    this.parent = undefined;
    this.element.remove();
  }

  get parent(): HaltiWidget | undefined {
    return this._parent;
  }

  set parent(value: HaltiWidget | undefined) {
    if (value === this._parent) return;
    if (this._parent !== undefined) {
      const previous = this._parent as DomHaltiWidget;
      const index = previous.children.indexOf(this);
      if (index >= 0) previous.children.splice(index, 1);
      this.element.remove();
    }
    this._parent = undefined;
    if (value !== undefined) value.appendChild(this);
  }

  get name(): string | undefined {
    return this._name;
  }

  set name(value: string | undefined) {
    this._name = value;
    if (value === undefined) delete this.element.dataset.haltiName;
    else this.element.dataset.haltiName = value;
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
    this.applyTransform();
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
    this.applyTransform();
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
    this.element.style.width = `${value}px`;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
    this.element.style.height = `${value}px`;
  }

  set color(value: HaltiWidget['color']) {
    this.element.style.backgroundColor =
      typeof value === 'string'
        ? value
        : value === undefined
          ? ''
          : `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a / 255})`;
  }

  set opacity(value: number | undefined) {
    this.element.style.opacity = value === undefined ? '' : String(value);
  }

  set visible(value: boolean | undefined) {
    this.element.style.display = value === false ? 'none' : 'block';
  }

  set clip(value: boolean | undefined) {
    this.element.style.overflow = value === true ? 'hidden' : 'visible';
  }

  set drawOrder(value: number | undefined) {
    this.element.style.zIndex = value === undefined ? '' : String(value);
  }

  get rotateZ(): number {
    return this._rotateZ;
  }

  set rotateZ(value: number) {
    this._rotateZ = value;
    this.applyTransform();
  }

  get scaleX(): number {
    return this._scaleX;
  }

  set scaleX(value: number) {
    this._scaleX = value;
    this.applyTransform();
  }

  get scaleY(): number {
    return this._scaleY;
  }

  set scaleY(value: number) {
    this._scaleY = value;
    this.applyTransform();
  }

  set transformOriginX(value: number | undefined) {
    this.element.style.transformOrigin = `${value ?? 0}px ${this.transformOriginYValue}px`;
  }

  private transformOriginYValue = 0;

  set transformOriginY(value: number | undefined) {
    this.transformOriginYValue = value ?? 0;
    this.element.style.transformOrigin = `0px ${this.transformOriginYValue}px`;
  }

  private applyTransform(): void {
    this.element.style.transform = `translate(${this._x}px, ${this._y}px) rotate(${this._rotateZ}rad) scale(${this._scaleX}, ${this._scaleY})`;
  }
}

export interface HaltiDomDriver {
  readonly rendererOptions: HaltiRendererOptions;
  readonly canvas: HTMLCanvasElement;
  readonly warnings: string[];
}

export const createHaltiDomDriver = (
  target: HTMLElement,
  appWidth: number,
  appHeight: number,
): HaltiDomDriver => {
  target.replaceChildren();
  target.style.position = 'relative';
  target.style.width = `${window.innerWidth}px`;
  target.style.height = `${window.innerHeight}px`;
  target.style.overflow = 'hidden';
  target.style.background = '#000';

  const canvas = document.createElement('canvas');
  canvas.style.display = 'none';
  target.appendChild(canvas);

  const layer = document.createElement('div');
  layer.style.position = 'absolute';
  layer.style.left = '0';
  layer.style.top = '0';
  layer.style.width = `${appWidth}px`;
  layer.style.height = `${appHeight}px`;
  layer.style.transformOrigin = '0 0';
  layer.style.transform = `scale(${window.innerWidth / appWidth}, ${window.innerHeight / appHeight})`;
  target.appendChild(layer);

  // Keep viewport scaling outside the Halti root. HaltiRenderer owns the root
  // transform and would otherwise replace the driver's browser-only scale.
  const root = new DomHaltiWidget();
  layer.appendChild(root.element);
  const warnings: string[] = [];

  return {
    canvas,
    warnings,
    rendererOptions: {
      root,
      createWidget: () => new DomHaltiWidget(),
      ensureFrameRendered: () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
      warn: (message) => {
        warnings.push(message);
        console.warn(message);
      },
    },
  };
};
