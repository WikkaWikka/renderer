import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import type { Vec4 } from '../../renderers/webgl/internal/ShaderUtils.js';
import { type RoundedWithBorderProps } from '../templates/RoundedWithBorderTemplate.js';
import type { ComputedBorderValues } from './Border.js';
import type { ComputedRoundedValues } from './Rounded.js';
export type ComputedRoundedWithBorderValues = ComputedRoundedValues & ComputedBorderValues & {
    outerBorderRadius: Vec4;
    innerBorderRadius: Vec4;
};
export declare const RoundedWithBorder: CanvasShaderType<RoundedWithBorderProps, ComputedRoundedWithBorderValues>;
