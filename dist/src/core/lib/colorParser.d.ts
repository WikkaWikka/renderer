export interface IParsedColor {
    isWhite: boolean;
    a: number;
    r: number;
    g: number;
    b: number;
}
/**
 * Extract color components
 */
export declare function parseColor(abgr: number): IParsedColor;
/**
 * Extract color components
 */
export declare function parseColorRgba(rgba: number): IParsedColor;
