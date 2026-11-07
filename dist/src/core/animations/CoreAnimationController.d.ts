import type { AnimationControllerState, IAnimationController } from '../../common/IAnimationController.js';
import type { AnimationManager } from './AnimationManager.js';
import type { CoreAnimation } from './CoreAnimation.js';
import { EventEmitter } from '../../common/EventEmitter.js';
export declare class CoreAnimationController extends EventEmitter implements IAnimationController {
    stoppedPromise: Promise<void> | null;
    /**
     * If this is null, then the animation is in a finished / stopped state.
     */
    stoppedResolve: (() => void) | null;
    state: AnimationControllerState;
    private manager;
    private animation;
    private readonly tickPayload;
    static readonly EVENTS: readonly ["stopped", "animating", "tick"];
    constructor();
    /**
     * Initialize (or reinitialize) this controller with new dependencies.
     * Called both on first use and when recycled from the pool.
     */
    init(manager: AnimationManager, animation: CoreAnimation): void;
    start(): IAnimationController;
    private getLoopErrorHandler;
    stop(reset?: boolean): IAnimationController;
    pause(): IAnimationController;
    restore(): IAnimationController;
    waitUntilStopped(): Promise<void>;
    release(): void;
    private registerAnimation;
    private unregisterAnimation;
    private onDestroy;
    private onFinished;
    private onAnimating;
    /**
     * manually override the tick event to emit the progress of the animation as well
     * we are first checking if there are any listeners for the tick event. this avoid unnecessary object creation.
     */
    private onTick;
}
