import type { RichSpan } from './RichTextParser.js';
/**
 * Shared style metrics for rich text.
 *
 * @remarks
 * Advance width and drawn extent must agree, otherwise styled runs either
 * collide with the text that follows them or get clipped by a texture sized
 * from a too-small measurement. The renderers used to compute these
 * independently; keeping the formulas here means measurement and drawing
 * cannot drift apart.
 */
/**
 * Amount the SDF alpha threshold is shifted for bold, matching
 * `threshold = 0.5 - v_style * SDF_BOLD_THRESHOLD_SHIFT` in SdfShader's
 * fragment source.
 *
 * @remarks
 * The rendered edge grows outward by `SDF_BOLD_THRESHOLD_SHIFT * distanceRange`
 * design units on each side (see {@link sdfBoldExtra}). At the previous value
 * of 0.05, a typical atlas baked with `distanceRange = 4` only dilates the
 * glyph edge by 0.2 design units per side — well under a pixel once scaled
 * to a rendered font size, so "bold" text was visually indistinguishable
 * from regular weight. 0.15 triples that dilation, producing a stroke growth
 * closer to what a real bold face looks like, while staying safely inside
 * (0, 0.5) so the shifted threshold never crosses zero or flips sign for any
 * standard SDF/MSDF atlas.
 *
 * Changing this constant without changing the shader (or vice versa) will
 * reintroduce the advance/extent mismatch it exists to prevent.
 */
export declare const SDF_BOLD_THRESHOLD_SHIFT = 0.15;
/**
 * Horizontal shear applied to fake italics in the SDF renderer: tan(14°).
 */
export declare const ITALIC_SHEAR: number;
/**
 * Extra advance width, in design units, that a synthetically emboldened SDF
 * glyph needs.
 *
 * @remarks
 * The SDF encodes signed distance such that the full 0..1 range of the sampled
 * median spans `distanceRange` design units. Lowering the threshold by
 * `SDF_BOLD_THRESHOLD_SHIFT` therefore pushes the rendered edge outward by
 * `SDF_BOLD_THRESHOLD_SHIFT * distanceRange` on each side, so the glyph grows
 * by twice that in total. The glyph's own `xadvance` is unchanged by the
 * shader, so without this correction bold text advances as if it were regular
 * and overlaps its neighbour.
 */
export declare const sdfBoldExtra: (distanceRange: number) => number;
/**
 * Extra advance width needed after the last glyph of an italic run.
 *
 * @remarks
 * Shearing leans the top of the glyph to the right without changing its
 * advance, so the final glyph of an italic run overhangs whatever follows it.
 * The widest excursion is at the top of the glyph box, i.e. the greatest
 * distance above the baseline.
 *
 * @param baseline Alphabetic baseline in design-unit space.
 * @param topY Top edge of the glyph box in design-unit space.
 */
export declare const italicOverhang: (baseline: number, topY: number) => number;
/**
 * Build the CSS font shorthand for a rich text span.
 *
 * @remarks
 * Span bold/italic override the node level `fontStyle`. The result is used for
 * both drawing and measuring, which is the whole point: measuring with the
 * regular face while drawing with the bold one is what makes styled runs
 * collide with following text.
 */
export declare const canvasSpanFont: (span: RichSpan, fontStyle: string, fontSize: number, fontFamily: string) => string;
/**
 * Index of the span covering `pos`, searching forward from `fromIdx`.
 *
 * @remarks
 * Spans are sorted by start offset and callers walk positions in ascending
 * order, so this only ever scans forward and the whole traversal stays linear.
 * Clamps to the last span, matching the renderers' existing behaviour for
 * positions past the final span end.
 */
export declare const spanIndexAt: (spans: RichSpan[], spanCount: number, pos: number, fromIdx: number) => number;
/**
 * Stroke thickness for underline and strikethrough, in pixels.
 */
export declare const decorationThickness: (fontSize: number) => number;
/**
 * Gap between the alphabetic baseline and the top of the underline, in pixels.
 */
export declare const underlineGap: (fontSize: number) => number;
/**
 * Fraction of the top-to-baseline distance at which the strikethrough sits.
 *
 * @remarks
 * A true strikethrough is centred on the x-height, but neither backend has
 * x-height available, so it is approximated as a fraction of the distance from
 * the top of the line box down to the alphabetic baseline.
 */
export declare const STRIKE_BASELINE_RATIO = 0.6;
/**
 * Distance from the top of the line box to the strikethrough, in pixels.
 *
 * @param baselineDistance Distance from the top of the line box to the
 * alphabetic baseline.
 */
export declare const strikeOffset: (baselineDistance: number) => number;
