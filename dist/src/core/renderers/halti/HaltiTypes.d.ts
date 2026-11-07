export interface HaltiImageSourceRect {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
export interface HaltiImage {
    url?: string;
    halign?: string;
    valign?: string;
    sourceRect?: HaltiImageSourceRect;
}
/**
 * Structural subset of an NRDP Gibbon widget used by the experimental backend.
 * The interface is deliberately structural so the renderer package does not
 * depend on NRDP type declarations.
 */
export interface HaltiWidget {
    appendChild(child: HaltiWidget): void;
    insertBefore?(child: HaltiWidget, before: HaltiWidget): void;
    destroy?(): void;
    parent?: HaltiWidget;
    children?: HaltiWidget[];
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string | {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    opacity?: number;
    visible?: boolean;
    clip?: boolean;
    drawOrder?: number;
    rotateZ?: number;
    scaleX?: number;
    scaleY?: number;
    transformOriginX?: number;
    transformOriginY?: number;
    image?: HaltiImage;
}
export interface HaltiRendererOptions {
    /** Existing Gibbon widget that owns the Lightning-rendered subtree. */
    root: HaltiWidget;
    /** Factory normally backed by `nrdp.gibbon.makeWidget({})`. */
    createWidget: () => HaltiWidget;
    /** Optional Halti completion boundary, normally `Halti.ensureFrameRendered`. */
    ensureFrameRendered?: () => Promise<void>;
    /** Optional diagnostic hook for deliberately unsupported semantics. */
    warn?: (message: string) => void;
}
