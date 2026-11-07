import { type CoreNode, type CoreNodeAnimateProps } from '../CoreNode.js';
import { type TimingFunction } from '../utils.js';
import { EventEmitter } from '../../common/EventEmitter.js';
import { type LoopErrorHandler } from '../../common/loopError.js';
export interface AnimationSettings {
    duration: number;
    delay: number;
    easing: string | TimingFunction;
    loop: boolean;
    repeat: number;
    stopMethod: 'reverse' | 'reset' | false;
}
type PropGroup = {
    keys: string[];
    starts: number[];
    targets: number[];
    isColor: boolean[];
    length: number;
};
type PropValuesMap = {
    props: PropGroup | null;
    shaderProps: PropGroup | null;
};
export declare class CoreAnimation extends EventEmitter {
    id: number;
    duration: number;
    easing: string | TimingFunction;
    loop: boolean;
    repeat: number;
    stopMethod: 'reverse' | 'reset' | false;
    private hasEasing;
    private invDuration;
    private progress;
    private delayFor;
    private delay;
    private timingFunction;
    private node?;
    activeIndex: number;
    private propsGroup;
    private shaderPropsGroup;
    static readonly EVENTS: readonly ["finished", "animating", "tick", "destroyed"];
    propValuesMap: PropValuesMap;
    constructor();
    /**
     * Error handler for app code fired from this animation (custom easing fns
     * and finished/tick/animating/destroyed listeners).
     */
    private getLoopErrorHandler;
    /**
     * Invoke the app-supplied easing function, falling back to `fallback` on throw.
     *
     * @remarks
     * The `try` lives here — not in `update()`/`updateValue()` — so those hot
     * functions stay `try`-free. No closure allocation (unlike a generic
     * safe-call helper): direct call keeps per-prop-per-frame cost to one call.
     */
    private applyEasing;
    /**
     * Initialize (or reinitialize) this animation with new parameters.
     * Called both on first use and when recycled from the pool.
     */
    init(node: CoreNode, props: Partial<CoreNodeAnimateProps>, settings: Partial<AnimationSettings>): void;
    release(): void;
    reset(): void;
    private restoreValues;
    restore(): void;
    private reverseValues;
    reverse(): void;
    /**
     * Interpolate a single property value given the current progress.
     * progress is passed as a parameter so callers can cache it in a local,
     * avoiding repeated this.progress reads (which box floats in V8).
     */
    updateValue(isColor: boolean, propValue: number, startValue: number, progress: number, onError?: LoopErrorHandler): number;
    private updateValues;
    update(dt: number): void;
}
export {};
