import type { Vec4 } from '../renderers/webgl/internal/ShaderUtils.js';
export declare const validateArrayLength4: (value: number | number[]) => Vec4;
export type PrefixedType<T, P extends string | undefined = undefined> = {
    [Key in keyof T as P extends string ? `${P}-${string & Key}` : Key]: T[Key];
};
