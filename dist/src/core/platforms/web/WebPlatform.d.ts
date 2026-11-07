import { Platform, type PlatformSettings } from '../Platform.js';
import { ImageWorkerManager, type ImageWorkerFactory } from './lib/ImageWorker.js';
import type { Stage } from '../../Stage.js';
import type { ImageResponse } from '../../textures/ImageTexture.js';
import type { GlContextWrapper } from '../GlContextWrapper.js';
export declare class WebPlatform extends Platform {
    private useImageWorker;
    private readonly numImageWorkers;
    private _imageWorkerManager;
    private hasWorker;
    private loopGeneration;
    private frameHandle;
    private timerHandle;
    private detachContextEvents;
    constructor(settings?: PlatformSettings);
    /**
     * Image worker pool, created on first image load.
     *
     * @remarks
     * The pool object itself is free (no workers spawn until the first image);
     * workers then grow on demand up to `numImageWorkers` (see
     * {@link ImageWorkerManager}). Image decoding is asynchronous and off the
     * frame path either way.
     */
    private get imageWorkerManager();
    protected createImageWorkerManager(numImageWorkers: number): ImageWorkerManager;
    protected getImageWorkerFactory(): ImageWorkerFactory;
    createCanvas(): HTMLCanvasElement;
    createOffscreenCanvas(): OffscreenCanvas | null;
    createContext(): GlContextWrapper;
    getElementById(id: string): HTMLElement | null;
    startLoop(stage: Stage): void;
    private drawRecoveryFrame;
    private cancelScheduledFrame;
    suspendFrameLoop(): void;
    private scheduleRecoveryFrame;
    stopLoop(): void;
    fetch(url: string): Promise<Blob>;
    createImage(blob: Blob, premultiplyAlpha: boolean, sx: number | null, sy: number | null, sw: number | null, sh: number | null): Promise<ImageResponse>;
    loadImage(src: string, premultiplyAlpha: boolean, sx?: number | null, sy?: number | null, sw?: number | null, sh?: number | null): Promise<ImageResponse>;
    loadSvg(src: string, width: number | null, height: number | null, sx?: number | null, sy?: number | null, sw?: number | null, sh?: number | null): Promise<ImageResponse>;
    loadCompressedTexture(src: string): Promise<ImageResponse>;
    getTimeStamp(): number;
    addFont(font: FontFace): void;
    loadFontFace(fontFamily: string, fontUrl: string): Promise<FontFace | null>;
}
