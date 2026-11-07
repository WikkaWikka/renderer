import { CoreShaderNode, type CoreShaderType } from './renderers/CoreShaderNode.js';
import type { CoreShaderProgram } from './renderers/CoreShaderProgram.js';
import type { Stage } from './Stage.js';
export type ShaderMap = Record<string, CoreShaderType>;
export type ExtractProps<Props> = {
    [K in keyof Props]: Props[K] extends {
        default: infer D;
    } ? D : Props[K];
};
export type PartialShaderProps<Props> = Partial<ExtractProps<Props>>;
export type ExtractShaderProps<T extends keyof ShaderMap> = ExtractProps<ShaderMap[T]['props']>;
export type OptionalShaderProps<T extends keyof ShaderMap> = PartialShaderProps<ShaderMap[T]['props']>;
export declare class CoreShaderManager {
    readonly stage: Stage;
    protected shTypes: ShaderMap;
    protected shCache: Map<string, CoreShaderProgram>;
    /**
     * valuesCache is used to store calculations that can be shared between shader nodes.
     */
    protected valuesCache: Map<string, Record<string, unknown>>;
    protected valuesCacheUsage: Map<string, number>;
    protected attachedShader: CoreShaderProgram | null;
    constructor(stage: Stage);
    registerShaderType(name: string, shType: CoreShaderType): void;
    /**
     * Remove a shader type and destroy its compiled programs.
     *
     * @remarks
     * Enables dynamic runtime shaders and hot-reload: after unregistering,
     * the same name can be registered again with new GLSL source and
     * re-created via {@link createShader}. Existing shader nodes hold a
     * direct program reference and are not auto-migrated — callers must
     * re-create them with `createShader` and reassign `node.shader`.
     *
     * Cache entries derived from `getCacheMarkers` (`name-marker`) are
     * evicted together with the base name.
     */
    unregisterShaderType(name: string): void;
    /**
     * Replace a shader type definition at runtime.
     *
     * @remarks
     * Equivalent to `unregisterShaderType` + `registerShaderType`. Compiled
     * programs for the old definition are destroyed so the next
     * {@link createShader} call compiles the new source.
     */
    updateShaderType(name: string, shType: CoreShaderType): void;
    /**
     * Loads a shader (if not already loaded) and returns a controller for it.
     *
     * @param shType
     * @param props
     * @returns
     */
    createShader<Name extends keyof ShaderMap>(name: Name, props?: Record<string, unknown>): CoreShaderNode | null;
    mutateShaderValueUsage(key: string, mutation: number): void;
    getShaderValues(key: string): Record<string, unknown> | undefined;
    setShaderValues(key: string, values: Record<string, unknown>): void;
    cleanup(): void;
    restoreContext(): void;
    useShader(shader: CoreShaderProgram): void;
    /**
     * Mark no shader as currently attached.
     *
     * Used after a transient GPU pass (e.g. stencil write) that activates a
     * shader outside the normal useShader flow, so the next useShader() call
     * performs a full attach() instead of a no-op.
     */
    releaseShader(): void;
}
