import type { WebGlShaderType } from '../../renderers/webgl/WebGlShaderNode.js';
/**
 * Plain SDF shader — no per-vertex style attribute.
 *
 * Used when richText=false (the default). The vertex format is 6 floats/vertex
 * (x, y, u, v, packed_color, distRange) and the fragment shader is the minimal
 * SDF path with no solid-fill branch. This keeps the VBO smaller and the
 * fragment shader cheap for all ordinary text nodes.
 */
export declare const SdfPlain: WebGlShaderType;
/**
 * Rich SDF shader — adds a per-vertex style attribute.
 *
 * Used when richText=true. The vertex format is 7 floats/vertex
 * (x, y, u, v, packed_color, style, distRange) and the fragment shader keeps
 * the rich-text features: `u = -1.0` decoration sentinel for solid-fill
 * underline/strikethrough quads and the bold SDF threshold shift.
 */
export declare const Sdf: WebGlShaderType;
