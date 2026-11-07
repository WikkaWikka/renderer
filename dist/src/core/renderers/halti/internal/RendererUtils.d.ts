import type { RectWithValid } from '../../../lib/utils.js';
export interface HaltiTransform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    hasSkew: boolean;
}
export interface MatrixLike {
    ta: number;
    tb: number;
    tc: number;
    td: number;
    tx: number;
    ty: number;
}
export interface HaltiContainerLayout {
    x: number;
    y: number;
    width: number;
    height: number;
    clip: boolean;
    contentOffsetX: number;
    contentOffsetY: number;
}
export declare const rgbaToCssHex: (rgba: number) => string;
export declare const decomposeHaltiTransform: (matrix: MatrixLike) => HaltiTransform;
export declare const resolveHaltiContainerLayout: (clippingRect: RectWithValid, appWidth: number, appHeight: number) => HaltiContainerLayout;
