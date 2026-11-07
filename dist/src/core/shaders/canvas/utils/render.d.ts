import type { Vec4 } from '../../../renderers/webgl/internal/ShaderUtils.js';
export declare function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: Vec4): void;
export declare function roundedRectWithBorder(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: Vec4, borderGap: number, outerX: number, outerY: number, outerW: number, outerH: number, outerBorderRadius: Vec4, innerX: number, innerY: number, innerW: number, innerH: number, innerBorderRadius: Vec4, borderColor: string, renderContext: () => void): void;
export declare function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, projection: Vec4, radius: Vec4, pixelRatio: number): void;
export declare function strokeLine(ctx: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, lineWidth: number): void;
