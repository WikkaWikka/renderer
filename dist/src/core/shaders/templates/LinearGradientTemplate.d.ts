import type { CoreShaderType } from '../../renderers/CoreShaderNode.js';
/**
 * Properties of the {@link LinearGradient} shader
 */
export interface LinearGradientProps {
    /**
     * Array of colors to be used in the LinearGradient shader
     *
     * @default [0xff000000, 0xffffffff]
     */
    colors: number[];
    /**
     * Angle of the LinearGradient shader, Angle in Radians
     *
     * @default 0
     */
    angle: number;
    /**
     * Array of color stops
     */
    stops: number[];
}
export declare const LinearGradientTemplate: CoreShaderType<LinearGradientProps>;
