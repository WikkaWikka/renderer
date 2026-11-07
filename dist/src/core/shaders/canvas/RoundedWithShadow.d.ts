import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import { type RoundedWithShadowProps } from '../templates/RoundedWithShadowTemplate.js';
import type { ComputedRoundedValues } from './Rounded.js';
import type { ComputedShadowValues } from './Shadow.js';
type ComputedValues = ComputedRoundedValues & ComputedShadowValues;
export declare const RoundedWithShadow: CanvasShaderType<RoundedWithShadowProps, ComputedValues>;
export {};
