import type { CoreShaderType } from '../../renderers/CoreShaderNode.js';
/**
 * Properties of the {@link RadialGradient} shader
 */
export interface RadialGradientProps {
    /**
     * Array of colors to be used in the RadialGradient shader
     *
     * @default [0xff000000, 0xffffffff]
     */
    colors: number[];
    /**
     * Array of color stops
     */
    stops: number[];
    /**
     * radial width of the RadialGradientEffect
     *
     * @remarks from the center to the outer edge of the gradient
     */
    w: number;
    /**
     * radial height of the RadialGradientEffect
     * if not defined uses the width value
     * @remarks from the center to the outer edge of the gradient
     */
    h: number;
    /**
     * center point of where the RadialGradientEffect is drawn
     */
    pivot: [number, number];
}
export declare const RadialGradientTemplate: CoreShaderType<RadialGradientProps>;
