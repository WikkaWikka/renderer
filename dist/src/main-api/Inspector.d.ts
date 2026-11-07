import { CoreNode, type CoreNodeAnimateProps, type CoreNodeProps } from '../core/CoreNode.js';
import { type RendererMainSettings } from './Renderer.js';
import type { AnimationSettings } from '../core/animations/CoreAnimation.js';
import type { AnimationControllerState } from '../common/IAnimationController.js';
import { CoreTextNode, type CoreTextNodeProps } from '../core/CoreTextNode.js';
import type { Texture } from '../core/textures/Texture.js';
/**
 * Inspector Options
 *
 * Configuration options for the Inspector's performance monitoring features.
 */
export interface InspectorOptions {
    /**
     * Enable performance monitoring for setter calls
     *
     * @defaultValue true
     */
    enablePerformanceMonitoring: boolean;
    /**
     * Threshold for excessive setter calls before logging a warning
     *
     * @defaultValue 100
     */
    excessiveCallThreshold: number;
    /**
     * Time interval in milliseconds to reset the setter call counters
     *
     * @defaultValue 5000
     */
    resetInterval: number;
    /**
     * Enable animation monitoring and statistics tracking
     *
     * @defaultValue true
     */
    enableAnimationMonitoring: boolean;
    /**
     * Maximum number of animations to keep in history for statistics
     *
     * @defaultValue 1000
     */
    maxAnimationHistory: number;
    /**
     * Automatically print animation statistics every X seconds (0 to disable)
     *
     * @defaultValue 0
     */
    animationStatsInterval: number;
}
export declare class Inspector {
    private root;
    private canvas;
    private mutationObserver;
    private resizeObserver;
    private height;
    private width;
    private scaleX;
    private scaleY;
    private textureMetrics;
    private static setterCallCount;
    private static activeAnimations;
    private static animationHistory;
    private performanceSettings;
    private animationStatsTimer;
    constructor(canvas: HTMLCanvasElement, settings: RendererMainSettings);
    /**
     * Track setter calls for performance monitoring
     * Only active when Inspector is loaded
     */
    private trackSetterCall;
    /**
     * Get current performance monitoring statistics
     */
    static getPerformanceStats(): Array<{
        nodeId: number;
        setterName: string;
        count: number;
        timeWindow: number;
    }>;
    /**
     * Clear performance monitoring statistics
     */
    static clearPerformanceStats(): void;
    /**
     * Generate a unique animation ID
     */
    private static generateAnimationId;
    /**
     * Wrap animation controller with monitoring capabilities
     */
    private wrapAnimationController;
    /**
     * Track animation start
     */
    private trackAnimationStart;
    /**
     * Update animation state
     */
    private updateAnimationState;
    /**
     * Track animation end
     */
    private trackAnimationEnd;
    /**
     * Get currently active animations
     */
    static getActiveAnimations(): Array<{
        nodeId: number;
        animationId: string;
        startTime: number;
        duration: number;
        elapsedTime: number;
        props: CoreNodeAnimateProps;
        settings: AnimationSettings;
        state: AnimationControllerState;
    }>;
    /**
     * Get animation statistics
     */
    static getAnimationStats(): {
        totalAnimations: number;
        activeCount: number;
        averageDuration: number;
    };
    /**
     * Clear animation monitoring data
     */
    static clearAnimationStats(): void;
    /**
     * Start the animation stats timer if enabled
     */
    private startAnimationStatsTimer;
    /**
     * Stop the animation stats timer
     */
    private stopAnimationStatsTimer;
    /**
     * Print current animation statistics to console
     */
    private printAnimationStats;
    setRootPosition(): void;
    createDiv(node: CoreNode, properties: CoreNodeProps | CoreTextNodeProps): HTMLElement;
    createNodes(node: CoreNode): boolean;
    createNode(node: CoreNode): CoreNode;
    createTextNode(node: CoreTextNode): CoreTextNode;
    createProxy(node: CoreNode | CoreTextNode, div: HTMLElement): CoreNode | CoreTextNode;
    updateTextNodeDimensions(div: HTMLElement, node: CoreTextNode): void;
    updateTextureAttributes(div: HTMLElement, texture: Texture): void;
    destroy(): void;
    destroyNode(id: number): void;
    updateNodeProperty(div: HTMLElement, property: keyof CoreNodeProps | keyof CoreTextNodeProps, value: any, props: CoreNodeProps | CoreTextNodeProps): void;
    updateViewport(width: number, height: number, deviceLogicalPixelRatio: number): void;
    animateNode(div: HTMLElement, props: CoreNodeAnimateProps, settings: AnimationSettings): void;
}
