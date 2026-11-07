import type { IEventEmitter } from './IEventEmitter.js';
import { type LoopErrorHandler } from './loopError.js';
export type EventListener = (target: any, data: any) => void;
/**
 * EventEmitter base class
 *
 * @remarks
 * The `eventListeners` map is allocated lazily on the first `on()` call.
 * Many objects (e.g. CoreNodes that never have listeners attached) avoid
 * the cost of allocating an empty `{}` at construction time.
 */
export declare class EventEmitter implements IEventEmitter {
    private eventListeners;
    on(event: string, listener: EventListener): void;
    off(event: string, listener?: EventListener): void;
    once(event: string, listener: EventListener): void;
    emit(event: string, data?: any): void;
    /**
     * Emit to all listeners, isolating each one from the others.
     *
     * @remarks
     * Unlike {@link emit}, a throwing listener neither aborts the remaining
     * listeners nor propagates to the caller (e.g. the rAF loop). Each error is
     * routed to `onError` (`handleLoopError`) or `console.error` and iteration
     * continues. Internal renderer code should keep using `emit` (fail loudly);
     * app-facing boundaries should use this.
     *
     * Kept as a separate method so the hot `emit` path — and more importantly
     * its callers in the frame loop — stay `try`-free for older JITs.
     */
    emitSafe(event: string, data?: any, onError?: LoopErrorHandler): void;
    /**
     * Check whether this emitter has any listeners registered.
     *
     * @param event - Optional event name. When provided, checks only that
     * event. When omitted, checks all events.
     * @returns `true` if at least one listener is registered.
     */
    hasListeners(event?: string): boolean;
    removeAllListeners(): void;
    /**
     * Clear all listeners for the given event names by setting their array
     * length to 0, WITHOUT deleting the keys. This keeps the eventListeners
     * object in V8's fast-properties mode and avoids re-allocating the arrays
     * on the next on() call. Use this for objects with a known fixed set of
     * event names (e.g. CoreAnimation, CoreAnimationController).
     *
     * Only writes arr.length = 0 when the array is non-empty -- skips the write
     * (and the write barrier on old-gen objects) when already empty, which is
     * the common case after unregisterAnimation() has removed all listeners.
     */
    clearListeners(events: readonly string[]): void;
}
