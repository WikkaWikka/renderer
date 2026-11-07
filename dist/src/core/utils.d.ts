/**
 * Core Utility Functions
 *
 * @module
 */
export declare const EPSILON = 0.000001;
export declare let ARRAY_TYPE: ArrayConstructor | Float32ArrayConstructor;
export declare const RANDOM: () => number;
export declare const ANGLE_ORDER = "zyx";
export type TimingFunction = (t: number) => number;
export declare const setMatrixArrayType: (type: Float32ArrayConstructor | ArrayConstructor) => void;
export declare const toRadian: (a: number) => number;
export declare const equals: (a: number, b: number) => boolean;
export declare const rand: (min: number, max: number) => number;
export declare const isPowerOfTwo: (value: number) => boolean | 0;
export declare const getTimingFunction: (str: string) => TimingFunction;
/**
 * Convert bytes to string of megabytes with 2 decimal points
 *
 * @param bytes
 * @returns
 */
export declare function bytesToMb(bytes: number): string;
