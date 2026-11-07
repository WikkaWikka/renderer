import { type IParsedColor } from '../../lib/colorParser.js';
import { CoreContextTexture } from '../CoreContextTexture.js';
export declare class CanvasTexture extends CoreContextTexture {
    protected image: ImageBitmap | HTMLCanvasElement | HTMLImageElement | undefined;
    /**
     * Tinted variants of {@link image}, keyed by CSS color string.
     *
     * @remarks
     * A single texture can be shared by many nodes with different colors
     * (e.g. deduplicated canvas text). `getImage` runs per node per frame, so
     * a single-slot cache would re-tint on every node (~1 canvas alloc +
     * fillRect + 2 drawImages each) whenever two nodes disagree on color.
     * The map keeps one entry per color actually in use; see
     * {@link MAX_TINT_CACHE} for the bound.
     */
    protected tintCache: Map<string, HTMLCanvasElement> | undefined;
    load(): void;
    release(): void;
    free(): void;
    updateMemSize(): void;
    hasImage(): boolean;
    getImage(color: IParsedColor): ImageBitmap | HTMLCanvasElement | HTMLImageElement | null;
    protected tintTexture(source: ImageBitmap | HTMLCanvasElement | HTMLImageElement, color: string): HTMLCanvasElement;
    private onLoadRequest;
}
