/**
 * A single styled run within stripped text.
 *
 * Instances live in the pre-allocated pool inside ParseResult and are reused
 * across calls. Only indices [0, ParseResult.spanCount) are valid after a
 * parse. Do not retain references across subsequent parseRichText calls on the
 * same ParseResult instance.
 */
export declare class RichSpan {
    start: number;
    end: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    color: number;
}
/**
 * Output container for parseRichText.
 *
 * Create one instance per rendering module and reuse it. The internal span
 * pool is pre-allocated in the constructor — zero heap allocation per parse.
 */
export declare class ParseResult {
    stripped: string;
    spanCount: number;
    readonly spans: RichSpan[];
    constructor();
    reset(): void;
}
/**
 * Parses BB-code formatted text into stripped plain text and an array of
 * styled spans.
 *
 * Supported tags (all lowercase, nestable):
 *   [b]…[/b]                 bold
 *   [i]…[/i]                 italic
 *   [u]…[/u]                 underline
 *   [s]…[/s]                 strikethrough
 *   [color=0xRRGGBBAA]…[/color]   inline color (VALUE must be a 0xRRGGBBAA
 *                            hex literal matching the renderer's internal
 *                            color format, e.g. [color=0xff0000ff])
 *
 * Unrecognised or malformed tags are emitted as literal text.
 * Mis-nested closing tags implicitly close any intervening open tags.
 *
 * The result is written into `out`. Span data is valid for indices
 * [0, out.spanCount). Do not retain span references across subsequent calls
 * on the same `out` instance.
 *
 * Performance: single-pass, O(n) in text length. Zero heap allocation in the
 * hot path — all spans and stack frames are reused from pre-allocated pools.
 */
export declare const parseRichText: (text: string, out: ParseResult) => void;
/**
 * Returns the plain text with all recognised BB-code tags removed.
 *
 * Faster than parseRichText when span metadata is not needed (e.g. layout
 * measurement). Unrecognised tags are preserved as literal text.
 *
 * Fast-paths text that contains no '[' characters with a single indexOf check.
 */
export declare const stripRichText: (text: string) => string;
