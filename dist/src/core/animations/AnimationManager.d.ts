import type { CoreNode, CoreNodeAnimateProps } from '../CoreNode.js';
import { CoreAnimation, type AnimationSettings } from './CoreAnimation.js';
import { CoreAnimationController } from './CoreAnimationController.js';
import type { IAnimationController } from '../../common/IAnimationController.js';
import type { LoopErrorHandler } from '../../common/loopError.js';
import type { Stage } from '../Stage.js';
export declare class AnimationManager {
    private activeAnimations;
    private stage;
    /**
     * Pool of reusable CoreAnimation instances.
     * Animations are returned to the pool when they finish or are stopped.
     */
    private animationPool;
    /**
     * Pool of reusable CoreAnimationController instances.
     * Controllers are returned to the pool alongside their animation.
     */
    private controllerPool;
    constructor(stage: Stage);
    /**
     * Error handler for app callbacks fired from the animation update path.
     *
     * @remarks
     * Read live from `platform.settings` (not cached) so late-assigned
     * handlers are honored. Returns `undefined` when no handler is set, in
     * which case `emitSafe`/`reportLoopError` fall back to `console.error`.
     */
    getLoopErrorHandler(): LoopErrorHandler | undefined;
    registerAnimation(animation: CoreAnimation): void;
    unregisterAnimation(animation: CoreAnimation): void;
    update(dt: number): void;
    /**
     * Create an animation controller, reusing pooled objects when available.
     * Objects are returned to the pool when the controller reaches a terminal
     * state (stopped via finish, manual stop, or node destruction).
     */
    createAnimation(node: CoreNode, props: Partial<CoreNodeAnimateProps>, settings: Partial<AnimationSettings>): IAnimationController;
    /**
     * Return an animation and its controller to the pool for reuse.
     * Called by CoreAnimationController when it reaches a terminal state
     * (after all user event listeners have been notified).
     */
    releaseToPool(animation: CoreAnimation, controller: CoreAnimationController): void;
}
