import type { GlContextWrapper } from '../../../platforms/GlContextWrapper.js';
export interface AttributeInfo {
    name: string;
    size: number;
    type: number;
    normalized: boolean;
    stride: number;
    offset: number;
}
export interface UniformInfo {
    name: string;
    uniform: keyof UniformMethodMap;
}
export type SingleValue = number | Float32Array | Int32Array;
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type UniformValue = SingleValue | Vec2 | Vec3 | Vec4;
export interface UniformCollection {
    hasStoredUniforms: boolean;
    single: Record<string, Uniform<SingleValue>>;
    vec2: Record<string, Uniform<Vec2>>;
    vec3: Record<string, Uniform<Vec3>>;
    vec4: Record<string, Uniform<Vec4>>;
}
export interface Uniform<T = UniformValue> {
    method: string;
    value: T;
}
export interface SupportedSetUniforms {
    uniform2fv: Float32Array;
    uniform2iv: Int32Array;
    uniform3fv: 'uniform2iv' | 'uniform3fv' | 'uniform3iv' | 'uniform4fv' | 'uniform4iv' | 'uniformMatrix2fv' | 'uniformMatrix3fv' | 'uniformMatrix4fv' | 'uniform1f' | 'uniform1fv' | 'uniform1i' | 'uniform1iv' | 'uniform3fv' | 'uniform2f' | 'uniform2i' | 'uniform3f' | 'uniform3i' | 'uniform4f' | 'uniform4i';
}
export interface ShaderOptions {
    shaderSources?: ShaderProgramSources;
    supportsIndexedTextures?: boolean;
    webgl1Extensions?: string[];
    webgl2Extensions?: string[];
}
type IsUniformMethod<MethodName, MethodType> = MethodName extends `uniform${string}` ? MethodType extends (location: WebGLUniformLocation | null, ...args: any[]) => void ? true : false : false;
export type UniformMethodMap = {
    [Key in keyof WebGLRenderingContext as IsUniformMethod<Key, WebGLRenderingContext[Key]> extends true ? Key : never]: WebGLRenderingContext[Key] extends (location: WebGLUniformLocation | null, ...args: infer T) => void ? T : never;
};
export type UniformSet1Param = Omit<UniformMethodMap, 'uniform2f' | 'uniform2i' | 'uniform3f' | 'uniform3i' | 'uniform4f' | 'uniform4i'>;
export type UniformSet2Params = Pick<UniformMethodMap, 'uniform2f' | 'uniform2i'>;
export type UniformSet3Params = Pick<UniformMethodMap, 'uniform3f' | 'uniform3i'>;
export type UniformSet4Params = Pick<UniformMethodMap, 'uniform4f' | 'uniform4i'>;
type TupleToObject<T extends any[]> = Omit<T, keyof any[]>;
export type UniformTupleToMap<Uniforms extends [...UniformInfo[]]> = {
    [Key in keyof TupleToObject<Uniforms> as TupleToObject<Uniforms>[Key] extends {
        name: infer K extends string;
    } ? K : never]: TupleToObject<Uniforms>[Key] extends {
        uniform: infer T extends keyof UniformMethodMap;
    } ? UniformMethodMap[T] : never;
};
export type ShaderSource = string | ((textureUnits: number) => string);
export interface ShaderProgramSources {
    vertex: ShaderSource;
    fragment: ShaderSource;
    webGl2?: {
        vertex: ShaderSource;
        fragment: ShaderSource;
    };
}
export declare function createShader(glw: GlContextWrapper, type: number, source: string): any;
export declare function createProgram(glw: GlContextWrapper, vertexShader: WebGLShader, fragmentShader: WebGLShader): any;
export declare const DefaultVertexSource = "\n  # ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n  # else\n  precision mediump float;\n  # endif\n\n  attribute vec2 a_position;\n  attribute vec2 a_textureCoords;\n  attribute vec4 a_color;\n  attribute vec2 a_nodeCoords;\n\n  uniform vec2 u_resolution;\n  uniform float u_pixelRatio;\n  uniform vec2 u_dimensions;\n  uniform vec4 u_shadow;\n\n  varying vec4 v_color;\n  varying vec2 v_textureCoords;\n\n  void main() {\n    vec2 normalized = a_position * u_pixelRatio;\n    vec2 screenSpace = vec2(2.0 / u_resolution.x, -2.0 / u_resolution.y);\n\n    vec2 outerEdge = clamp(a_textureCoords * 2.0 - vec2(1.0), -1.0, 1.0);\n    vec2 shadowEdge = outerEdge;\n    vec2 vertexPos = normalized + outerEdge + shadowEdge;\n    v_color = a_color;\n    v_textureCoords = a_textureCoords;\n\n    gl_Position = vec4(vertexPos.x * screenSpace.x - 1.0, -sign(screenSpace.y) * (vertexPos.y * -abs(screenSpace.y)) + 1.0, 0.0, 1.0);\n  }\n";
/**
 * generate fragment source for
 * @param stops
 * @returns
 */
export declare function genGradientColors(stops: number): string;
export {};
