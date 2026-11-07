import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import { type RoundedWithBorderAndShadowProps } from '../templates/RoundedWithBorderAndShadowTemplate.js';
import type { ComputedRoundedWithBorderValues } from './RoundedWithBorder.js';
import type { ComputedShadowValues } from './Shadow.js';
type ComputedValues = ComputedRoundedWithBorderValues & ComputedShadowValues;
export declare const RoundedWithBorderAndShadow: CanvasShaderType<RoundedWithBorderAndShadowProps, ComputedValues>;
export {};
