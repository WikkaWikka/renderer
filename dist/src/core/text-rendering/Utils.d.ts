import type { CoreTextNodeProps } from '../CoreTextNode.js';
/**
 * Returns CSS font setting string for use in canvas context.
 *
 * @param fontFace
 * @param fontStyle
 * @param fontSize
 * @param precision
 * @param defaultFontFace
 * @returns
 */
export declare function getFontSetting(fontFace: string | string[], fontStyle: string, fontSize: number, precision: number, defaultFontFace: string): string;
/**
 * Returns true if the given character is a zero-width space.
 *
 * @param space
 */
export declare function hasZeroWidthSpace(space: string): boolean;
/**
 * Returns true if the given character is a zero-width space or a regular space.
 *
 * @param space
 */
export declare function isSpace(space: string): boolean;
/**
 * Converts a string into an array of tokens and the words between them.
 *
 * @param tokenRegex
 * @param text
 */
export declare function tokenizeString(tokenRegex: RegExp, text: string): string[];
export declare function getLayoutCacheKey(props: CoreTextNodeProps): string;
