import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import type { Vec4 } from '../../renderers/webgl/internal/ShaderUtils.js';
import { type HolePunchProps } from '../templates/HolePunchTemplate.js';
export interface ComputedHolePunchValues {
    radius: Vec4;
}
export declare const HolePunch: CanvasShaderType<HolePunchProps, ComputedHolePunchValues>;
