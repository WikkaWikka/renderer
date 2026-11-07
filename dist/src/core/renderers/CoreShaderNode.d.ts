import { type CoreNode } from '../CoreNode.js';
import type { Stage } from '../Stage.js';
export interface AdvShaderProp<T = any, Props = Record<string, unknown>> {
    /**
     * default value
     */
    default: T;
    resolve?: (this: AdvShaderProp<T, Props>, value: T, props: Props) => T;
    transform?: (start: T, end: T, progress: number) => T;
}
export type AdvancedShaderProp<T = any, Props = Record<string, unknown>> = (AdvShaderProp<T, Props> & {
    set: (value: T, props: Props) => void;
    get: (props: Props) => T;
}) | (AdvShaderProp<T, Props> & {
    set?: never;
    get?: never;
});
export type ShaderProp<T, Props> = T | AdvancedShaderProp<T, Props>;
export type ShaderProps<Props> = {
    [K in keyof Props]: ShaderProp<Props[K], Props>;
};
export declare function isAdvancedShaderProp(obj: any): obj is AdvancedShaderProp;
export declare function resolveShaderProps(props: Record<string, unknown>, propsConfig: ShaderProps<Record<string, unknown>>): void;
/**
 * CoreShaderType is a template for ShaderTypes the renderer.
 * You could view a ShaderType as a configuration object that contains methods,
 * and values that you can use to alter the way a node is drawn by the Renderer.
 */
export interface CoreShaderType<Props extends object = any> {
    /**
     * Values you use to draw the Shader
     */
    props?: ShaderProps<Props>;
    /**
     * used for making a cache key to check for reusability, currently only used for webgl ShaderTypes but might be needed for other types of renderer
     */
    getCacheMarkers?: (props: Props) => string;
    /**
     * timer that updates every loop, by default uses the stage elapsed time If you want to do a special calculation you can define a function.
     * When you calculate your own value you can use the Stage timing values deltaTime, lastFrameTime, and currentFrameTime;
     */
    time?: boolean | ((stage: Stage) => number);
}
/**
 * CoreShaderNode is a base class that manages the shader prop values.
 * When a prop is being updated the CoreShaderNode will notify either the associated CoreNode,
 * or the Stage that there has been a change and a new render of the scene.
 */
export declare class CoreShaderNode<Props extends object = Record<string, unknown>> {
    readonly shaderKey: string;
    readonly stage: Stage;
    readonly shaderType: CoreShaderType<Props>;
    protected propsConfig: ShaderProps<Props> | undefined;
    readonly resolvedProps: Props | undefined;
    protected definedProps: Props | undefined;
    protected node: CoreNode | null;
    readonly time: CoreShaderType['time'];
    update: (() => void) | undefined;
    beforeDraw: (() => void) | undefined;
    private _valueKeyCache;
    private _valueKeyDirty;
    private _lastW;
    private _lastH;
    constructor(shaderKey: string, type: CoreShaderType<Props>, stage: Stage, props?: Props);
    private defineProps;
    attachNode(node: CoreNode): void;
    createValueKey(): string;
    get props(): Props | undefined;
    set props(props: Props | undefined);
}
