import type { WebGlShaderType } from '../../renderers/webgl/WebGlShaderNode.js';
/**
 * Minimal shader used exclusively for the stencil write pass during
 * rounded-corner clipping. Color output is discarded (colorMask is off when
 * this shader runs). The fragment shader uses an SDF rounded-rect function to
 * discard fragments that fall outside the clip shape so only in-bounds pixels
 * increment the stencil buffer.
 *
 * Props are set directly via uniforms by the renderer — this shader is never
 * exposed as a user-selectable shader type.
 *
 * Uniforms set by WebGlRenderer.beginRoundedClip():
 *   u_dimensions  — vec2 clip region width/height in pixels
 *   u_position    — vec2 clip region top-left corner in screen pixels
 *   u_radius      — float uniform corner radius (pixels)
 *   u_resolution  — vec2 canvas resolution (shared renderer uniform)
 *   u_pixelRatio  — float pixel ratio (shared renderer uniform)
 */
export declare const StencilClip: WebGlShaderType;
