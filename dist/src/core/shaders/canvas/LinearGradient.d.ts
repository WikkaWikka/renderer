import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import { type LinearGradientProps } from '../templates/LinearGradientTemplate.js';
export interface ComputedLinearGradientValues {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    colors: string[];
}
export declare const LinearGradient: CanvasShaderType<LinearGradientProps, ComputedLinearGradientValues>;
