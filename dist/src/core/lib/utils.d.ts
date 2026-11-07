import type { Vec4 } from '../renderers/webgl/internal/ShaderUtils.js';
export type RGBA = [r: number, g: number, b: number, a: number];
export declare const getNormalizedRgbaComponents: (rgba: number) => RGBA;
export declare const getRgbaComponents: (rgba: number) => RGBA;
export declare const norm: (rgba: number) => number;
export declare function getNormalizedAlphaComponent(rgba: number): number;
/**
 * Get a CSS color string from a RGBA color
 *
 * @param color
 * @returns
 */
export declare function getRgbaString(color: RGBA): string;
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface RectWithValid extends Rect {
    valid: boolean;
    /**
     * Radius for rounded corner clipping (WebGL only).
     * 0 = rectangular scissor clipping (default).
     */
    clipRadius: number;
}
export interface Bound {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export interface Coord {
    x: number;
    y: number;
}
export interface BoundWithValid extends Bound {
    valid: boolean;
}
export declare function createBound<T extends Bound = Bound>(x1: number, y1: number, x2: number, y2: number, out?: T): T;
export declare function intersectBound<T extends Bound = Bound>(a: Bound, b: Bound, out?: T): T;
export declare function boundsOverlap(a: Bound, b: Bound): boolean;
export declare function convertBoundToRect(bound: Bound): Rect;
export declare function convertBoundToRect<T extends Rect = Rect>(bound: Bound, out: T): T;
export declare function intersectRect(a: Rect, b: Rect): Rect;
export declare function intersectRect<T extends Rect = Rect>(a: Rect, b: Rect, out: T): T;
export declare function copyRect(a: Rect): Rect;
export declare function copyRect<T extends Rect = Rect>(a: Rect, out: T): T;
export declare function compareRect(a: Rect | null, b: Rect | null): boolean;
export declare function boundInsideBound(bound1: Bound, bound2: Bound): boolean;
export declare function boundLargeThanBound(bound1: Bound, bound2: Bound): boolean;
export declare function pointInBound(x: number, y: number, bound: Bound): boolean;
export declare function isBoundPositive(bound: Bound): boolean;
export declare function isRectPositive(rect: Rect): boolean;
/**
 * Create a preload bounds from a strict bound
 *
 * @param strictBound The strict boundary of the node
 * @param boundsMargin Boundary margin to apply to the strictBound
 * @returns
 */
export declare function createPreloadBounds(strictBound: Bound, boundsMargin: [number, number, number, number]): Bound;
export declare function calcFactoredRadius(radius: number, width: number, height: number): number;
export declare function valuesAreEqual(values: number[]): boolean;
export declare function calcFactoredRadiusArray(radius: Vec4, width: number, height: number): [number, number, number, number];
