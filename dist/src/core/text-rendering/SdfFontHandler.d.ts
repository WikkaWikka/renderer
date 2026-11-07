import type { FontFamilyMap, FontMetrics, NormalizedFontMetrics, TrProps, FontLoadOptions } from './TextRenderer.js';
import type { ImageTexture } from '../textures/ImageTexture.js';
import type { Stage } from '../Stage.js';
import type { CoreTextNode } from '../CoreTextNode.js';
/**
 * SDF Font Data structure matching msdf-bmfont-xml output
 */
export interface SdfFontData {
    pages: string[];
    chars: Array<{
        id: number;
        char: string;
        x: number;
        y: number;
        width: number;
        height: number;
        xoffset: number;
        yoffset: number;
        xadvance: number;
        page: number;
        chnl: number;
    }>;
    kernings: Array<{
        first: number;
        second: number;
        amount: number;
    }>;
    info: {
        face: string;
        size: number;
        bold: number;
        italic: number;
        charset: string[];
        unicode: number;
        stretchH: number;
        smooth: number;
        aa: number;
        padding: [number, number, number, number];
        spacing: [number, number];
        outline: number;
    };
    common: {
        lineHeight: number;
        base: number;
        scaleW: number;
        scaleH: number;
        pages: number;
        packed: number;
        alphaChnl: number;
        redChnl: number;
        greenChnl: number;
        blueChnl: number;
    };
    distanceField: {
        fieldType: 'sdf' | 'msdf';
        distanceRange: number;
    };
    lightningMetrics?: FontMetrics;
}
/**
 * @typedef {Object} SdfGlyph
 * @property {number} id - Glyph ID
 * @property {string} char - Character
 * @property {number} x - Atlas x position
 * @property {number} y - Atlas y position
 * @property {number} width - Glyph width
 * @property {number} height - Glyph height
 * @property {number} xoffset - X offset
 * @property {number} yoffset - Y offset
 * @property {number} xadvance - Character advance width
 * @property {number} page - Page number
 * @property {number} chnl - Channel
 */
/**
 * @typedef {Object} KerningTable
 * Fast lookup table for kerning values
 */
type KerningTable = Record<number, Record<number, number | undefined> | undefined>;
/**
 * @typedef {Object} SdfFontCache
 * Cached font data for performance
 */
export interface SdfFont {
    data: SdfFontData;
    glyphMap: Map<number, SdfFontData['chars'][0]>;
    kernings: KerningTable;
    atlasTexture: ImageTexture;
    metrics: FontMetrics;
    maxCharHeight: number;
}
/**
 * Check if the SDF font handler can render a font
 * @param {TrProps} trProps - Text rendering properties
 * @returns {boolean} True if the font can be rendered
 */
export declare const canRenderFont: (trProps: TrProps) => boolean;
/**
 * Register an SDF font from JSON + PNG atlas.
 *
 * @remarks
 * Registration only stores where to find the font — no fetch, decode, or
 * GPU upload happens here. Loading starts on first use (see
 * {@link requestLoad}) or explicit {@link preloadFont}, so registered fonts
 * that are never rendered cost nothing.
 *
 * @param {Object} options - Font loading options
 * @param {string} options.fontFamily - Font family name
 * @param {string} options.fontUrl - JSON font data URL (atlasDataUrl)
 * @param {string} options.atlasUrl - PNG atlas texture URL
 * @param {FontMetrics} options.metrics - Optional font metrics
 */
export declare const loadFont: (_stage: Stage, options: FontLoadOptions) => Promise<void>;
/**
 * Eagerly load a previously registered (or new) SDF font.
 *
 * @remarks
 * Use when first-paint readiness must be guaranteed (e.g. awaited before
 * drawing). Unlike {@link loadFont}, this resolves only after the atlas is
 * decoded, uploaded, and processed.
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
 * Stop waiting for a font to load
 * @param {string} fontFamily - Font family name
 * @param {CoreTextNode} node - Node that was waiting for the font
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
/**
 * Get the font families map for resolving fonts
 */
export declare const getFontFamilies: () => FontFamilyMap;
/**
 * Initialize the SDF font handler
 */
export declare const init: (_c?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void;
export declare const type = "sdf";
/**
 * Check if a font is already loaded by font family
 */
export declare const isFontLoaded: (fontFamily: string) => boolean;
/**
 * Get normalized font metrics for a font family
 */
export declare const getFontMetrics: (fontFamily: string, fontSize: number) => NormalizedFontMetrics;
export declare const processFontMetrics: (fontFamily: string, fontSize: number, metrics: FontMetrics) => NormalizedFontMetrics;
/**
 * Get glyph data for a character in a specific font
 * @param {string} fontFamily - Font family name
 * @param {number} codepoint - Character codepoint
 * @returns {Object|null} Glyph data or null if not found
 */
export declare const getGlyph: (fontFamily: string, codepoint: number) => SdfFontData["chars"][0] | null;
/**
 * Get kerning value between two glyphs
 * @param {string} fontFamily - Font family name
 * @param {number} firstGlyph - First glyph ID
 * @param {number} secondGlyph - Second glyph ID
 * @returns {number} Kerning value or 0
 */
export declare const getKerning: (fontFamily: string, firstGlyph: number, secondGlyph: number) => number;
/**
 * Get atlas texture for a font family
 * @param {string} fontFamily - Font family name
 * @returns {ImageTexture|null} Atlas texture or null
 */
export declare const getAtlas: (fontFamily: string) => ImageTexture | null;
/**
 * Get font data for a font family
 * @param {string} fontFamily - Font family name
 * @returns {SdfFontData|null} Font data or null
 */
export declare const getFontData: (fontFamily: string) => SdfFont | undefined;
/**
 * Get maximum character height for a font family
 * @param {string} fontFamily - Font family name
 * @returns {number} Max character height or 0
 */
export declare const getMaxCharHeight: (fontFamily: string) => number;
/**
 * Get all loaded font families
 * @returns {string[]} Array of font family names
 */
export declare const getLoadedFonts: () => string[];
/**
 * Unload a font and free resources
 * @param {string} fontFamily - Font family name
 */
export declare const unloadFont: (fontFamily: string) => void;
export declare const measureText: (text: string, fontFamily: string, letterSpacing: number) => number;
export {};
