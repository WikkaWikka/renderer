import type { WebGlShaderType } from '../../renderers/webgl/WebGlShaderNode.js';
import { type RoundedProps } from '../templates/RoundedTemplate.js';
/**
 * Similar to the {@link DefaultShader} but cuts out 4 rounded rectangle corners
 * as defined by the specified corner {@link RoundedProps.radius}
 */
export declare const Rounded: WebGlShaderType<RoundedProps>;
