import type { CanvasShaderType } from '../../renderers/canvas/CanvasShaderNode.js';
import { type BorderProps } from '../templates/BorderTemplate.js';
export interface ComputedBorderValues {
    borderColor: string;
    borderAsym: boolean;
    innerX: number;
    innerY: number;
    innerW: number;
    innerH: number;
    outerX: number;
    outerY: number;
    outerW: number;
    outerH: number;
}
export declare const Border: CanvasShaderType<BorderProps, ComputedBorderValues>;
