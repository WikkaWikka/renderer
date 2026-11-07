import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import type { Vec4 } from '../../renderers/webgl/internal/ShaderUtils.js';
import { type RoundedProps } from '../templates/RoundedTemplate.js';
export interface ComputedRoundedValues {
    radius: Vec4;
}
export declare const Rounded: CanvasShaderType<RoundedProps, ComputedRoundedValues>;
