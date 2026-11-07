import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import { type RadialGradientProps } from '../templates/RadialGradientTemplate.js';
export interface ComputedRadialGradientValues {
    pivotX: number;
    pivotY: number;
    scaleX: number;
    scaleY: number;
    size: number;
    colors: string[];
}
export declare const RadialGradient: CanvasShaderType<RadialGradientProps, ComputedRadialGradientValues>;
