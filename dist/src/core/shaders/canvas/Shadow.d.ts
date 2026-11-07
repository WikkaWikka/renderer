import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import type { Vec4 } from '../../renderers/webgl/internal/ShaderUtils.js';
import { type ShadowProps } from '../templates/ShadowTemplate.js';
export interface ComputedShadowValues {
    shadowColor: string;
    shadowRadius: Vec4;
}
export declare const Shadow: CanvasShaderType<ShadowProps, ComputedShadowValues>;
