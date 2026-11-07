import type { FontFamilyMap, FontLoadOptions, FontMetrics, NormalizedFontMetrics } from './TextRenderer.js';
import type { Stage } from '../Stage.js';
import type { CoreTextNode } from '../CoreTextNode.js';
/**
 * Check if a font can be rendered
 */
export declare const canRenderFont: () => boolean;
/**
 * Register a font by providing fontFamily, fontUrl, and optional metrics.
 *
 * @remarks
 * Registration only stores where to find the font — no `FontFace` fetch
 * happens here. Loading starts on first use (see {@link requestLoad}) or
 * explicit {@link preloadFont}, so registered fonts that are never rendered
 * cost nothing.
 */
export declare const loadFont: (_stage: Stage, options: FontLoadOptions) => Promise<void>;
/**
 * Eagerly load a previously registered (or new) canvas font.
 *
 * @remarks
 * Use when first-paint readiness must be guaranteed (e.g. awaited before
 * drawing). Unlike {@link loadFont}, this resolves only after the `FontFace`
 * is fetched and processed.
 */
export declare const preloadFont: (stage: Stage, options: FontLoadOptions) => Promise<void>;
/**
 * Start loading a registered font if it hasn't started yet.
 *
 * @remarks
 * Cheap and idempotent: map lookups plus promise dedup. Called on first use
 * (node creation / update ticks) so the first text node warms its own font.
 * Load failures are logged; waiting nodes behave as before.
 */
export declare const requestLoad: (stage: Stage, fontFamily: string) => void;
/**
 * Get the font families map for resolving fonts
 */
export declare const getFontFamilies: () => FontFamilyMap;
/**
 * Initialize the global font handler
 */
export declare const init: (c: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, mc?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void;
export declare const type = "canvas";
/**
 * Check if a font is already loaded by font family
 */
export declare const isFontLoaded: (fontFamily: string) => boolean;
/**
 * Wait for a font to load
 *
 * @param fontFamily
 * @param node
 */
export declare const waitingForFont: (fontFamily: string, node: CoreTextNode) => void;
/**
 * Stop waiting for a font to load
 *
 * @param fontFamily
 * @param node
 * @returns
 */
export declare const stopWaitingForFont: (fontFamily: string, node: CoreTextNode) => void;
export declare const getFontMetrics: (fontFamily: string, fontSize: number) => NormalizedFontMetrics;
export declare const processFontMetrics: (fontFamily: string, fontSize: number, metrics: FontMetrics) => NormalizedFontMetrics;
export declare const measureText: (text: string, _fontFamily: string, // Unused, but necessary to match SdfFontHandler's signature
letterSpacing: number) => number;
/**
 * Set the CSS font used by {@link measureText}.
 *
 * @remarks
 * `measureText` deliberately ignores its `fontFamily` argument (it only exists
 * to match SdfFontHandler's signature) and measures against a shared, module
 * level context. Rich text needs to measure bold and italic runs with the same
 * face they will be drawn with, otherwise the advance width is taken from the
 * regular face and styled runs collide with the text that follows them.
 *
 * Callers that change the measure font are responsible for restoring it, since
 * the context is shared with font metric calculation and the plain text path.
 *
 * Returns true if the font actually changed. Assigning `context.font` forces
 * the UA to parse the font shorthand, so the redundant-write guard is
 * worthwhile in the per-segment draw loop.
 */
export declare const setMeasureFont: (font: string) => boolean;
/**
 * The CSS font string currently used by {@link measureText}.
 */
export declare const getMeasureFont: () => string;
/**
 * Get the font metrics for a font face.
 *
 * @remarks
 * This function will attempt to grab the explicitly defined metrics from the
 * font face first. If the font face does not have metrics defined, it will
 * attempt to calculate the metrics using the browser's measureText method.
 *
 * If the browser does not support the font metrics API, it will use some
 * default values.
 *
 * @param context
 * @param fontFace
 * @param fontSize
 * @returns
 */
export declare function calculateFontMetrics(fontFamily: string): FontMetrics;
