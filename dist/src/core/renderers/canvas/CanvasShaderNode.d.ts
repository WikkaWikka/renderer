import type { CoreNode } from '../../CoreNode.js';
import type { Stage } from '../../Stage.js';
import { CoreShaderNode, type CoreShaderType } from '../CoreShaderNode.js';
export type CanvasShaderType<T extends object = Record<string, unknown>, C extends object = Record<string, unknown>> = CoreShaderType<T> & {
    render: (this: CanvasShaderNode<T, C>, ctx: CanvasRenderingContext2D, node: CoreNode, renderContext: () => void) => void;
    update?: (this: CanvasShaderNode<T, C>, node: CoreNode) => void;
    /**
     * Set this to true when using ctx functions that scale, clip, rotate, etc..
     */
    saveAndRestore?: boolean;
};
export declare class CanvasShaderNode<Props extends object = Record<string, unknown>, Computed extends object = Record<string, unknown>> extends CoreShaderNode<Props> {
    private updater;
    private valueKey;
    computed: Partial<Computed>;
    applySNR: boolean;
    render: CanvasShaderType<Props>['render'];
    constructor(shaderKey: string, config: CanvasShaderType<Props>, stage: Stage, props?: Props);
    toColorString(rgba: number): string;
}
