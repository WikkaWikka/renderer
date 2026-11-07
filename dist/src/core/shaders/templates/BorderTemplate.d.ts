import type { CoreShaderType } from '../../renderers/CoreShaderNode.js';
import { type PrefixedType } from '../utils.js';
/**
 * Properties of the {@link Border} shader
 */
export interface BorderProps {
    /**
     * Width of the border in pixels
     *
     * @default 0
     */
    w: number | [number, number, number, number];
    /**
     * Color of the border in 0xRRGGBBAA
     *
     * @default 0xffffffff
     */
    color: number;
    /**
     * Alignment of the border
     *
     * @default 'inside'
     */
    align: number | 'inside' | 'center' | 'outside';
    /**
     * Gap between node and border baseline. Default is 0. and generally edge of node)
     */
    gap: number;
    /**
     * Top width
     */
    top: number;
    /**
     * Right width
     */
    right: number;
    /**
     * Bottom width
     */
    bottom: number;
    /**
     * Left width
     */
    left: number;
}
export declare function getBorderProps<P extends string>(prefix?: P): PrefixedType<BorderProps, P>;
export declare const BorderTemplate: CoreShaderType<BorderProps>;
