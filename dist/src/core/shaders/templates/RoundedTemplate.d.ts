import type { CoreShaderType } from '../../renderers/CoreShaderNode.js';
/**
 * Properties of the {@link RoundedRectangle} shader
 */
export interface RoundedProps {
    /**
     * Corner radius, in pixels, to cut out of the corners
     *
     * @defaultValue 0
     */
    radius: number | number[];
    /**
     * sets top-left corner
     */
    'top-left': number;
    /**
     * sets top-right corner
     */
    'top-right': number;
    /**
     * sets bottom-right corner
     */
    'bottom-right': number;
    /**
     * sets bottom-left corner
     */
    'bottom-left': number;
}
export declare const RoundedTemplate: CoreShaderType<RoundedProps>;
