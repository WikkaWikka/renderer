/**
 * Error handler for application callbacks invoked from the render loop.
 *
 * @remarks
 * Kept in its own module so the `try/catch` below is never inlined into the
 * hot `runLoop` / `update()` functions. The loop itself stays `try`-free
 * (friendly to older JITs); only this cold error path carries the `try`.
 */
export type LoopErrorHandler = (error: unknown) => void;
/**
 * Report an error thrown by application code.
 *
 * Never rethrows: the render loop must survive bad client callbacks.
 * If the app provided `handleLoopError`, it is invoked in all environments
 * (its own throws are swallowed and only logged in dev). Otherwise the error
 * goes to `console.error` in development builds and is swallowed silently in
 * production.
 */
export declare function reportLoopError(error: unknown, onError?: LoopErrorHandler): void;
/**
 * Invoke an application callback, routing throws to `reportLoopError`.
 *
 * @remarks
 * Isolated here (instead of inline `try/catch` at each call site) so hot
 * functions (`runLoop`, `AnimationManager.update`, `CoreAnimation.update`)
 * contain no `try` keyword and stay optimizable.
 */
export declare function invokeAppCallback(fn: () => void, onError?: LoopErrorHandler): void;
/**
 * Invoke a value-returning application callback (e.g. a custom easing
 * function), falling back to `fallback` when it throws.
 *
 * @remarks
 * Same isolation rationale as {@link invokeAppCallback}: the `try` lives
 * here, callers in the animation hot path stay `try`-free.
 */
export declare function invokeAppCallbackWithFallback<T>(fn: () => T, fallback: T, onError?: LoopErrorHandler): T;
