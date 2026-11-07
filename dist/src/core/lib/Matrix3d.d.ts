/**
 * A 3D matrix representing a 2D graphics transformation
 *
 * @remarks
 * For convenience, entries in the first two rows can be accessed by the following
 * properties:
 * | ta tb tx |
 * | tc td ty |
 * | 0  0  1  |
 *
 * This matrix is optimized for 2D transformations and hence the last row will
 * always be considered [0, 0 ,1].
 *
 * To access a column major array for WebGL, use the {@link getFloatArr} method.
 */
export declare class Matrix3d {
    ta: number;
    tb: number;
    tx: number;
    tc: number;
    td: number;
    ty: number;
    private _floatArr;
    /**
     * Potential Mutation Flag
     *
     * @remarks
     * This flag is set to true whenever the matrix is potentially modified.
     * We don't waste CPU trying to identify if each operation actually modifies
     * the matrix. Instead, we set this flag to true whenever we think the matrix
     * is modified. This signals that the `floatArr` should to be updated.
     */
    private mutation;
    /**
     * Creates a new 3x3 matrix.
     *
     * @param entries Row-major 3x3 matrix
     */
    constructor();
    /**
     * Returns a temporary matrix that can be used for calculations.
     *
     * @remarks
     * This is useful for avoiding allocations in tight loops.
     *
     * The matrix is not guaranteed to be the same between calls.
     *
     * @returns
     */
    static get temp(): Matrix3d;
    static multiply(a: Matrix3d, b: Matrix3d, out?: Matrix3d): Matrix3d;
    static identity(out?: Matrix3d): Matrix3d;
    static translate(x: number, y: number, out?: Matrix3d): Matrix3d;
    static scale(sx: number, sy: number, out?: Matrix3d): Matrix3d;
    static rotate(angle: number, out?: Matrix3d): Matrix3d;
    static copy(src: Matrix3d, dst?: Matrix3d): Matrix3d;
    translate(x: number, y: number): Matrix3d;
    /**
     * Set only the translation fields (tx, ty) without touching ta/tb/tc/td.
     *
     * @remarks
     * Use this when the matrix is known to already be in identity-shape
     * (ta=1, tb=0, tc=0, td=1). Saves 4 field writes vs Matrix3d.translate().
     */
    setTranslate(x: number, y: number): void;
    /**
     * If `other` is a pure translation (identity-shape), apply it via the
     * cheaper `translate()` (2 muls). Otherwise fall back to `multiply()`
     * (8 muls).
     */
    translateOrMultiply(other: Matrix3d): Matrix3d;
    scale(sx: number, sy: number): Matrix3d;
    rotate(angle: number): Matrix3d;
    multiply(other: Matrix3d): Matrix3d;
    /**
     * Returns the matrix as a Float32Array in column-major order.
     *
     * @remarks
     * This method is optimized to avoid unnecessary allocations. The same array
     * is returned every time this method is called, and is updated in place.
     *
     * WARNING: Use the array only for passing directly to a WebGL shader uniform
     * during a frame render. Do not modify or hold onto the array for longer than
     * a frame.
     */
    getFloatArr(): Float32Array;
}
